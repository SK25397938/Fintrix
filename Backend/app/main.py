from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from .config import load_env
from .rag import RagService, parse_json_object
from .sebi import SebiRepository
from .storage import JsonStore


ROOT_DIR = Path(__file__).resolve().parents[2]
SEBI_DIR = ROOT_DIR / "sebi"
DATA_DIR = ROOT_DIR / "Backend" / "data"
load_env(ROOT_DIR)

app = FastAPI(title="Fintrix API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

users = JsonStore(DATA_DIR / "users.json", {})
chats = JsonStore(DATA_DIR / "chats.json", [])
posts = JsonStore(DATA_DIR / "posts.json", _default_posts := [
    {
        "id": "post-sebi-watch",
        "author": "Fintrix",
        "title": "SEBI document watcher is connected",
        "body": "The local backend can now list and reference downloaded SEBI circulars, master circulars, and regulations.",
        "comments": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
])
sebi_repo = SebiRepository(SEBI_DIR)
rag_service = RagService(sebi_repo, DATA_DIR)


class AuthPayload(BaseModel):
    email: str
    password: str = Field(min_length=1)
    name: str | None = None


class ChatCreate(BaseModel):
    title: str = "New chat"


class MessageCreate(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class AiMessagePayload(BaseModel):
    session_id: str | None = None
    message: str
    persist: bool = False


class EvaluationPayload(BaseModel):
    input_data: dict
    debug: bool = False


class WhatIfPayload(BaseModel):
    question: str


class BlogPostCreate(BaseModel):
    author: str
    title: str
    body: str


class CommentCreate(BaseModel):
    author: str
    body: str


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def make_token(email: str) -> str:
    return f"dev-{email}-{uuid4().hex}"


def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization:
        return {"email": "developer@fintrix.local", "name": "Developer Mode"}
    token = authorization.removeprefix("Bearer ").strip()
    for user in users.read().values():
        if user.get("token") == token:
            return {"email": user["email"], "name": user.get("name") or user["email"].split("@")[0]}
    if token.startswith("dev-"):
        return {"email": "developer@fintrix.local", "name": "Developer Mode"}
    raise HTTPException(status_code=401, detail="Invalid or expired token.")


@app.get("/")
def root():
    return {"name": "Fintrix API", "status": "ok", "sebi_documents": len(sebi_repo.list_documents())}


@app.get("/api/health")
def health():
    rag_status = rag_service.status()
    return {
        "status": "ok",
        "sebi_root": str(SEBI_DIR),
        "sebi_documents": rag_status["documents"],
        "rag_chunks": rag_status["chunks"],
        "mistral_configured": rag_status["mistral_configured"],
    }


@app.get("/api/rag/status")
def rag_status():
    return rag_service.status()


@app.post("/api/auth/signup")
def signup(payload: AuthPayload):
    data = users.read()
    key = payload.email.lower()
    token = make_token(key)
    data[key] = {"email": key, "name": payload.name or key.split("@")[0], "password": payload.password, "token": token}
    users.write(data)
    user = {"email": key, "name": data[key]["name"]}
    return {"token": token, "user": user, **user}


@app.post("/api/auth/login")
def login(payload: AuthPayload):
    data = users.read()
    key = payload.email.lower()
    user_record = data.get(key)
    if not user_record or user_record.get("password") != payload.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    user_record["token"] = make_token(key)
    data[key] = user_record
    users.write(data)
    user = {"email": key, "name": user_record.get("name") or key.split("@")[0]}
    return {"token": user_record["token"], "user": user, **user}


@app.get("/api/auth/me")
def me(user: dict = Depends(current_user)):
    return user


@app.get("/api/sebi/documents")
def list_sebi_documents(q: str | None = None):
    if q:
        return sebi_repo.search(q, limit=20)
    return sebi_repo.list_documents()


@app.get("/api/sebi/search")
def search_sebi(q: str, limit: int = 10):
    return sebi_repo.search(q, limit=max(1, min(limit, 30)))


@app.get("/docs/{filename}")
def get_document(filename: str):
    path = sebi_repo.find_pdf_by_name(filename)
    if not path:
        raise HTTPException(status_code=404, detail="Document not found.")
    return FileResponse(path, media_type="application/pdf", filename=path.name)


@app.get("/api/docs/{filename}")
def get_document_via_api(filename: str):
    return get_document(filename)


@app.get("/api/chats")
def list_chats(user: dict = Depends(current_user)):
    user_email = user["email"]
    return [
        {key: chat[key] for key in ("id", "title", "created_at", "updated_at")}
        for chat in sorted(chats.read(), key=lambda item: item.get("updated_at", ""), reverse=True)
        if chat.get("owner") == user_email
    ]


@app.post("/api/chats")
def create_chat(payload: ChatCreate, user: dict = Depends(current_user)):
    data = chats.read()
    chat = {
        "id": uuid4().hex,
        "owner": user["email"],
        "title": payload.title.strip() or "New chat",
        "messages": [],
        "created_at": now(),
        "updated_at": now(),
    }
    data.append(chat)
    chats.write(data)
    return {key: chat[key] for key in ("id", "title", "created_at", "updated_at")}


@app.get("/api/chats/{chat_id}/messages")
def list_messages(chat_id: str, user: dict = Depends(current_user)):
    chat = _get_chat(chat_id, user["email"])
    return chat["messages"]


@app.post("/api/chats/{chat_id}/messages")
def add_message(chat_id: str, payload: MessageCreate, user: dict = Depends(current_user)):
    data = chats.read()
    for chat in data:
        if chat["id"] == chat_id and chat["owner"] == user["email"]:
            message = {"id": uuid4().hex, "role": payload.role, "content": payload.content, "created_at": now()}
            chat["messages"].append(message)
            chat["updated_at"] = now()
            chats.write(data)
            return message
    raise HTTPException(status_code=404, detail="Chat not found.")


@app.delete("/api/chats/{chat_id}")
def delete_chat(chat_id: str, user: dict = Depends(current_user)):
    data = chats.read()
    next_data = [chat for chat in data if not (chat["id"] == chat_id and chat["owner"] == user["email"])]
    chats.write(next_data)
    return {"deleted": len(next_data) != len(data)}


@app.post("/api/ai/session/message")
def ai_message(payload: AiMessagePayload, user: dict = Depends(current_user)):
    result = rag_service.answer(payload.message, mode="ai_agent")

    return {
    "answer": result["answer"],
    "summary": result["summary"],
    "key_points": result["key_points"],
    "risk_level": result["risk_level"],
    "risk_score": result["risk_score"],
    "recommendations": result["recommendations"],
    "confidence": result["confidence"],
    "sources": result["sources"],
    "helpful_links": [],
    "source_reliability": {
        "local_sebi_rag": "high",
        "model": result["model"],
    },
    "mode": "SEBI_RAG",
    "is_off_topic": False,
}


@app.post("/api/rules/evaluate")
def evaluate_rules(payload: EvaluationPayload, user: dict = Depends(current_user)):
    input_data = payload.input_data
    domain = str(input_data.get("domain", "")).lower()
    amount = float(input_data.get("amount") or 0)
    declared = bool(input_data.get("declared"))
    description = str(input_data.get("description", "")).strip()
    rules = _rules()
    matched = [
        rule for rule in rules
        if rule["domain"] == domain and amount >= rule["amount_threshold"] and (rule["requires_declaration"] and not declared)
    ]
    prompt = f"""
You are Fintrix.

Evaluate this compliance scenario using ONLY the retrieved SEBI regulations.

Scenario

Domain:
{domain}

Amount:
₹{amount:,.0f}

Declared:
{declared}

Description:
{description}

Return ONLY JSON.

{{
    "summary":"",
    "compliance_status":"",
    "risk_level":"",
    "risk_score":0,
    "violated_rules":[],
    "recommendations":[],
    "confidence":0
}}
"""
    rag_result = rag_service.answer(prompt, mode="compliance", response_format="evaluation_json")
    llm_payload = (
    rag_result
    if rag_result["used_llm"]
    else None
)
    if llm_payload:
        llm_payload.setdefault("summary", "Generated from SEBI RAG context.")
        llm_payload.setdefault("compliance_status", "Needs Review")
        llm_payload.setdefault("risk_level", "Medium")
        llm_payload.setdefault("risk_score", 50)
        if not llm_payload.get("violated_rules"):
         llm_payload["violated_rules"] = matched
        if "recommendations" not in llm_payload:
         llm_payload["recommendations"] = []
        llm_payload.setdefault("confidence", 90)
        llm_payload["sources"] = rag_result["sources"]
        llm_payload["rag"] = {"used_llm": rag_result["used_llm"], "model": rag_result["model"]}
        if payload.debug:
            llm_payload["debug"] = {"input_data": input_data, "deterministic_matches": matched}
        return llm_payload

    return {
        "total_rules": len(rules),
        "match_count": len(matched),
        "matched_rules": matched,
        "rule_summary": {
            "summary": rag_result["answer"] if rag_result["answer"] else (
                "Review required before proceeding." if matched else "No configured rule violation matched this input."
            )
        },
        "sources": rag_result["sources"],
        "rag": {"used_llm": rag_result["used_llm"], "model": rag_result["model"]},
        "debug": {"input_data": input_data} if payload.debug else None,
    }


@app.post("/api/what-if")
def what_if(payload: WhatIfPayload, user: dict = Depends(current_user)):
    question = payload.question.strip()
    rag_result = rag_service.answer(question, mode="what_if", response_format="what_if_json")
    if rag_result.get("used_llm"):
     rag_result["sources"] = rag_result.get("sources", [])

    rag_result["rag"] = {
    "used_llm": rag_result.get("used_llm", False),
    "model": rag_result.get("model"),
}
    return rag_result

    matches = rag_result["sources"]
    risky = any(term in question.lower() for term in ["without", "default", "overdue", "not declared", "insider"])
    return {
        "compliance_status": "Needs review" if risky else "Preliminary clear",
        "risk_level": "High" if risky else "Medium",
        "rule_summary": matches[0]["title"] if matches else "No exact SEBI document match found.",
       "analysis": rag_result["answer"],
        "what_could_happen_next": {
            "immediate": ["Internal compliance may ask for transaction purpose and evidence."],
            "regulatory": ["Regulatory reporting or clarification may be needed if thresholds or disclosure rules apply."],
            "tax": ["Tax or audit teams may request supporting documentation."],
        },
        "what_should_you_do": {
            "immediate_actions": ["Pause execution until the facts are documented."],
            "compliance_actions": ["Compare the scenario with the cited SEBI documents."],
            "risk_mitigation": ["Keep approvals, declarations, and audit trail in one place."],
        },
        "sources": matches,
        "rag": {"used_llm": rag_result["used_llm"], "model": rag_result["model"]},
    }


@app.get("/api/news")
def news():
    documents = sebi_repo.list_documents()[:8]
    return [
        {
            "id": document["id"],
            "source": "SEBI Local",
            "title": document["title"],
            "description": f"{document['category'].replace('_', ' ').title()} published {document.get('published_date') or 'date unavailable'}.",
            "url": document.get("official_url") or document.get("url"),
            "image_url": None,
        }
        for document in documents
    ]


@app.get("/api/blog/posts")
def list_posts():
    return sorted(posts.read(), key=lambda item: item.get("created_at", ""), reverse=True)


@app.post("/api/blog/posts")
def create_post(payload: BlogPostCreate):
    data = posts.read()
    post = {
        "id": uuid4().hex,
        "author": payload.author,
        "title": payload.title,
        "body": payload.body,
        "comments": [],
        "created_at": now(),
    }
    data.append(post)
    posts.write(data)
    return post


@app.post("/api/blog/posts/{post_id}/comments")
def create_comment(post_id: str, payload: CommentCreate):
    data = posts.read()
    for post in data:
        if post["id"] == post_id:
            comment = {"id": uuid4().hex, "author": payload.author, "body": payload.body, "created_at": now()}
            post["comments"].append(comment)
            posts.write(data)
            return comment
    raise HTTPException(status_code=404, detail="Post not found.")


@app.delete("/api/blog/posts/{post_id}")
def delete_post(post_id: str):
    data = posts.read()
    next_data = [post for post in data if post["id"] != post_id]
    posts.write(next_data)
    return {"deleted": len(next_data) != len(data)}


def _get_chat(chat_id: str, owner: str) -> dict:
    for chat in chats.read():
        if chat["id"] == chat_id and chat["owner"] == owner:
            return chat
    raise HTTPException(status_code=404, detail="Chat not found.")


def json_safe(value):
    if isinstance(value, list):
        return [json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: json_safe(item) for key, item in value.items()}
    return value


def _rules() -> list[dict]:
    return [
        {
            "rule_id": "FOREX-DECL-001",
            "domain": "forex",
            "title": "High-value forex transfer declaration",
            "description": "Large foreign transfers should include declared purpose and supporting documentation.",
            "amount_threshold": 500000,
            "requires_declaration": True,
        },
        {
            "rule_id": "LEND-NPA-001",
            "domain": "lending",
            "title": "Overdue exposure review",
            "description": "Large overdue lending exposure should trigger credit and compliance review.",
            "amount_threshold": 1000000,
            "requires_declaration": True,
        },
        {
            "rule_id": "TRAD-PIT-001",
            "domain": "trading",
            "title": "Insider trading disclosure check",
            "description": "Sensitive trades require disclosure and restricted-list review.",
            "amount_threshold": 100000,
            "requires_declaration": True,
        },
        {
            "rule_id": "BOND-NCS-001",
            "domain": "bonds",
            "title": "Non-convertible securities listing review",
            "description": "Material NCS issuance activity should be checked against SEBI listing rules.",
            "amount_threshold": 1000000,
            "requires_declaration": True,
        },
    ]
