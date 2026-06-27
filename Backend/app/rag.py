import json
import math
import os
import re
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from .config import get_mistral_api_key, get_mistral_model
from .sebi import SebiRepository


TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9_/-]{2,}")
INDEX_VERSION = 2

def detect_mode(question: str) -> str:
    q = question.lower()

    if any(x in q for x in [
        "what if",
        "suppose",
        "if i",
        "can i",
        "will happen"
    ]):
        return "WHAT_IF"

    if any(x in q for x in [
        "comply",
        "compliance",
        "violation",
        "legal",
        "allowed"
    ]):
        return "COMPLIANCE"

    return "GENERAL"

class RagService:
    def __init__(self, sebi_repo: SebiRepository, data_dir: Path):
        self.sebi_repo = sebi_repo
        self.index_path = data_dir / "rag_index.json"
        self.index_path.parent.mkdir(parents=True, exist_ok=True)

    def status(self) -> dict:
        index = self._load_or_build_index()
        return {
            "mistral_configured": bool(get_mistral_api_key()),
            "model": get_mistral_model(),
            "documents": len(self.sebi_repo.list_documents()),
            "chunks": len(index.get("chunks", [])),
            "text_extraction": index.get("text_extraction", "metadata"),
        }

    def answer(self, question: str, mode: str = "ai_agent", response_format: str = "text") -> dict:

     if mode == "ai_agent":
         mode = detect_mode(question)

     chunks = self.retrieve(question, limit=12)

     prompt = self._build_prompt(
        question,
        chunks,
        mode,
        response_format,
    )

     llm_text = self._call_mistral(prompt)

     if not llm_text:
        llm_text = self._fallback_answer(question, chunks, mode)

     sources = [self._source_from_chunk(chunk) for chunk in chunks]

     parsed = parse_json_object(llm_text)

     if parsed:

      if response_format == "what_if_json":
        parsed["sources"] = sources
        parsed["used_llm"] = True
        parsed["model"] = get_mistral_model()
        return parsed

      if response_format == "evaluation_json":
        parsed["sources"] = sources
        parsed["used_llm"] = True
        parsed["model"] = get_mistral_model()
        return parsed

      return {
    "answer": parsed.get("answer", ""),
    "summary": parsed.get("summary", ""),
    "key_points": parsed.get("key_points", []),
    "risk_level": parsed.get("risk_level", "Unknown"),
    "risk_score": parsed.get("risk_score", 0),
    "recommendations": parsed.get("recommendations", []),
    "confidence": parsed.get("confidence", 0),
    "sources": sources,
    "raw_chunks": chunks,
    "used_llm": True,
    "model": get_mistral_model(),
}
     
     return {
    "answer": llm_text,
    "summary": "",
    "key_points": [],
    "risk_level": "Unknown",
    "risk_score": 0,
    "recommendations": [],
    "confidence": 0,
    "sources": sources,
    "raw_chunks": chunks,
    "used_llm": bool(get_mistral_api_key()),
    "model": get_mistral_model(),
}

    def retrieve(self, query: str, limit: int = 6) -> list[dict]:
        index = self._load_or_build_index()
        query_terms = self._tokens(query)
        if not query_terms:
            return index.get("chunks", [])[:limit]

        scored = []
        for chunk in index.get("chunks", []):
            chunk_terms = set(chunk.get("tokens", []))
            overlap = len(query_terms & chunk_terms)
            if overlap == 0:
                continue
            title_bonus = len(query_terms & set(self._tokens(chunk.get("title", "")))) * 2
            category_bonus = len(query_terms & set(self._tokens(chunk.get("category", ""))))
            score = overlap + title_bonus + category_bonus
            score = score / math.sqrt(max(len(chunk_terms), 1))
            scored.append((score, chunk))

        scored.sort(key=lambda item: item[0], reverse=True)
        if scored:
            return [chunk for _, chunk in scored[:limit]]

        return [
            self._document_to_chunk(document)
            for document in self.sebi_repo.search(query, limit=limit)
        ]

    def _load_or_build_index(self) -> dict:
        signature = self._signature()
        if self.index_path.exists():
            try:
                cached = json.loads(self.index_path.read_text(encoding="utf-8"))
                if cached.get("version") == INDEX_VERSION and cached.get("signature") == signature:
                    return cached
            except json.JSONDecodeError:
                pass

        index = self._build_index(signature)
        self.index_path.write_text(json.dumps(index, indent=2), encoding="utf-8")
        return index

    def _build_index(self, signature: list[dict]) -> dict:
        chunks = []
        extracted_any_pdf_text = False

        for document in self.sebi_repo.list_documents():
            path = self.sebi_repo.find_pdf_by_name(document.get("filename") or "")
            text = self._extract_pdf_text(path) if path else ""
            if text.strip():
                extracted_any_pdf_text = True
                for index, chunk_text in enumerate(self._chunk_text(text)):
                    chunks.append(self._document_to_chunk(document, chunk_text, index))
            else:
                chunks.append(self._document_to_chunk(document))

        return {
            "version": INDEX_VERSION,
            "signature": signature,
            "text_extraction": "pdf" if extracted_any_pdf_text else "metadata",
            "chunks": chunks,
        }

    def _extract_pdf_text(self, path: Path | None) -> str:
        if not path or not path.exists():
            return ""
        try:
            from pypdf import PdfReader
        except ImportError:
            return ""

        try:
            reader = PdfReader(str(path))
            pages = []
            for page in reader.pages[:80]:
                try:
                    pages.append(page.extract_text() or "")
                except Exception:
                    continue
            return "\n".join(pages)
        except Exception:
            return ""

    def _document_to_chunk(self, document: dict, text: str | None = None, index: int = 0) -> dict:
        fallback = " ".join(
            str(document.get(field) or "")
            for field in ("title", "category", "published_date", "priority", "id")
        )
        chunk_text = (text or fallback).strip()
        return {
            "id": f"{document.get('id') or document.get('filename')}-{index}",
            "document_id": document.get("id"),
            "title": document.get("title") or document.get("filename") or "SEBI document",
            "category": document.get("category"),
            "filename": document.get("filename"),
            "url": document.get("url"),
            "official_url": document.get("official_url"),
            "published_date": document.get("published_date"),
            "text": chunk_text[:1800],
            "tokens": sorted(self._tokens(chunk_text)),
        }

    def _chunk_text(self, text: str, size: int = 1400, overlap: int = 220) -> list[str]:
        cleaned = re.sub(r"\s+", " ", text).strip()
        if not cleaned:
            return []
        chunks = []
        start = 0
        while start < len(cleaned):
            chunks.append(cleaned[start : start + size])
            start += size - overlap
        return chunks[:250]

    def _signature(self) -> list[dict]:
        signature = []
        for document in self.sebi_repo.list_documents():
            path = self.sebi_repo.find_pdf_by_name(document.get("filename") or "")
            if not path:
                continue
            stat = path.stat()
            signature.append({"file": path.name, "size": stat.st_size, "mtime": stat.st_mtime})
        return sorted(signature, key=lambda item: item["file"])

    def _build_prompt(self, question: str, chunks: list[dict], mode: str, response_format: str) -> str:
        context = "\n\n".join(
            f"Source {index + 1}: {chunk['title']} ({chunk.get('filename')})\n{chunk['text']}"
            for index, chunk in enumerate(chunks)
        )

        # -------------------- COMPLIANCE --------------------

        if response_format == "evaluation_json":
         return f"""
You are Fintrix.

You are an expert SEBI Compliance Officer.

Use ONLY the retrieved SEBI regulations.

Never invent regulations.

Evaluate this scenario.

Scenario

{question}

Retrieved Context

{context if context else "No relevant SEBI context found."}

Return ONLY valid JSON.

{{
    "summary":"",
    "compliance_status":"",
    "risk_level":"",
    "risk_score":0,
    "violated_rules":[
        {{
            "rule_id":"",
            "title":"",
            "reason":""
        }}
    ],
    "recommendations":[],
    "confidence":0
    }}
"""

# -------------------- WHAT IF --------------------

        if response_format == "what_if_json":
         return f"""
You are Fintrix.

You are an expert Indian Financial Compliance AI.

Analyze ONLY using the retrieved SEBI regulations.

Never invent regulations.

Return ONLY valid JSON.

{{
    "compliance_status":"",
    "risk_level":"",
    "rule_summary":"",
    "analysis":"",
    "what_could_happen_next": {{
        "immediate": [],
        "regulatory": [],
        "financial": []
    }},
    "what_should_you_do": {{
        "immediate_actions": [],
        "compliance_actions": [],
        "risk_mitigation": []
    }}
}}

Scenario:

{question}

Retrieved Context:

{context}
"""
        format_instruction = "Answer in clear paragraphs with bullet points where useful."

        return f"""
You are Fintrix, an Enterprise AI Financial Compliance Assistant.

You answer ONLY from the retrieved SEBI context.

Never invent:
- Regulations
- Penalties
- Dates
- Legal procedures

If the retrieved context does not contain the answer, respond exactly with:

"I could not find this information in the retrieved SEBI documents."

------------------------------------

Mode:
{mode}

------------------------------------

Return ONLY valid JSON.

JSON Format:

{{
    "summary": "",
    "answer": "",
    "key_points": [],
    "risk_level": "",
    "risk_score": 0,
    "recommendations": [],
    "confidence": 0
}}

Rules:

summary
- One concise sentence.

answer
- Explain naturally.
- Maximum 150 words.
- Do NOT use markdown.
- Do NOT use bullet points.
- Keep the explanation concise.

key_points
- Array of short strings.

risk_level
- Low
- Medium
- High

risk_score
- Integer between 0 and 100.

recommendations
- Actionable compliance steps.

confidence
- Integer between 0 and 100 based only on retrieved context.

Never return markdown.

Never wrap the JSON inside ```json.

Return ONLY the JSON object.

Do not include any explanation before or after the JSON.

Question:

{question}

Retrieved Context:

{context if context else "No relevant SEBI context found."}

Additional Instruction:

{format_instruction}
"""

    def _call_mistral(self, prompt: str) -> str:
        api_key = get_mistral_api_key()
        if not api_key:
            return ""

        payload = {
    "model": get_mistral_model(),
    "messages": [
        {
            "role": "system",
            "content": (
    "You are Fintrix. "
    "Answer ONLY from the retrieved SEBI context. "
    "Never invent regulations. "
    "Always follow the required JSON format exactly."
)
        },
        {
            "role": "user",
            "content": prompt
        }
    ],
    "temperature": 0,
    "max_tokens": 900
}
        request = urllib.request.Request(
            "https://api.mistral.ai/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=int(os.environ.get("MISTRAL_TIMEOUT", "35"))) as response:
                data = json.loads(response.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"].strip()
        except (KeyError, urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            return ""

    def _fallback_answer(self, question: str, chunks: list[dict], mode: str) -> str:
        if not chunks:
            return "No relevant SEBI context was found in the local document folder."
        titles = "; ".join(chunk["title"] for chunk in chunks[:3])
        return (
            "Mistral is not configured or did not return a response, so this is a retrieval-only result. "
            f"Relevant SEBI sources found: {titles}. Add MISTRAL_API_KEY to .env for generated analysis."
        )

    def _source_from_chunk(self, chunk: dict) -> dict:
        return {
            "title": chunk.get("title"),
            "file": chunk.get("filename"),
            "url": chunk.get("url"),
            "category": chunk.get("category"),
            "published_date": chunk.get("published_date"),
        }

    def _tokens(self, text: str) -> set[str]:
        stop = {"the", "and", "for", "with", "from", "that", "this", "shall", "sebi"}
        return {token.lower() for token in TOKEN_RE.findall(text or "") if token.lower() not in stop}


def parse_json_object(text: str) -> dict[str, Any] | None:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", stripped, re.DOTALL)
        if not match:
            return None
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None
