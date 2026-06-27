# 💼 Fintrix – AI Financial Compliance Assistant

Fintrix is an AI-powered financial compliance platform that helps users understand Indian financial regulations through Retrieval-Augmented Generation (RAG), scenario analysis, and compliance evaluation.

Built for hackathons, Fintrix combines semantic search over official regulatory documents with Large Language Models to provide explainable, regulation-backed responses.

---

# 🚀 Features

## 🤖 AI Compliance Agent

- Ask natural language questions about SEBI regulations
- Answers generated using Retrieval-Augmented Generation (RAG)
- Retrieves relevant sections from official regulatory documents
- Grounded responses with source references
- Hallucination-controlled prompting

Examples:

- What are the disclosure requirements for insider trading?
- Explain Unpublished Price Sensitive Information (UPSI).
- What are the responsibilities of a compliance officer?

---

## ⚠️ What-If Simulator

Analyze financial scenarios before taking action.

Example:

> What if I buy company shares before quarterly earnings are announced?

Fintrix evaluates:

- Compliance Status
- Risk Level
- Rule Summary
- Detailed Analysis
- Possible Regulatory Consequences
- Recommended Actions

---

## 📑 Compliance Evaluation Simulator

Evaluate financial activities against SEBI regulations.

Returns:

- Matching Regulations
- Compliance Score
- Relevant Rule Summary
- Supporting Regulatory Documents

---

# 🧠 AI Architecture

User Query
        │
        ▼
Sentence Transformer Embeddings
        │
        ▼
Hybrid Retrieval
(FAISS + BM25)
        │
        ▼
Relevant SEBI Documents
        │
        ▼
Mistral LLM
        │
        ▼
Structured JSON Response
        │
        ▼
React Dashboard

---

# 🛠 Tech Stack

## Frontend

- Next.js
- React
- Tailwind CSS

## Backend

- FastAPI
- Python

## AI Stack

- Mistral AI
- Sentence Transformers
- FAISS
- BM25
- RAG Pipeline

## Data

- Official SEBI Regulatory Documents
- PDF Knowledge Base
- Manifest-based Document Indexing

---

# 📂 Project Structure

```
Fintrix/

├── Backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── rag.py
│   │   ├── repository.py
│   │   ├── storage.py
│   │   └── ...
│   └── requirements.txt
│
├── Frontend/
│   └── fintrix-web/
│
├── sebi/
│   ├── manifest.json
│   ├── circulars/
│   ├── regulations/
│   └── ...
│
└── README.md
```

---

# ⚙️ Installation

## Clone

```bash
git clone <repository-url>

cd Fintrix
```

---

## Backend

```bash
cd Backend

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env`

```env
MISTRAL_API_KEY=your_api_key_here
```

Run

```bash
python -m uvicorn app.main:app --reload --port 8001
```

---

## Frontend

```bash
cd Frontend/fintrix-web

npm install

npm run dev
```

---

# 🔍 Retrieval Pipeline

1. User submits a question
2. Query embedding generated using Sentence Transformers
3. Hybrid retrieval performed using:

- FAISS Semantic Search
- BM25 Keyword Search

4. Relevant SEBI document chunks retrieved
5. Context injected into Mistral
6. Structured JSON response generated
7. Response displayed with sources

---

# 📄 Data Sources

Fintrix retrieves information from official regulatory documents including:

- SEBI Regulations
- SEBI Circulars
- SEBI Master Circulars
- Compliance Guidelines

---

# 📊 Example Response

```json
{
  "compliance_status": "Non-Compliant",
  "risk_level": "High",
  "rule_summary": "...",
  "analysis": "...",
  "what_could_happen_next": {
    "immediate": [],
    "regulatory": [],
    "financial": []
  },
  "what_should_you_do": {
    "immediate_actions": [],
    "compliance_actions": [],
    "risk_mitigation": []
  }
}
```

---

# 🎯 Future Scope

- RBI Integration
- MCA Integration
- NSE/BSE Circular Monitoring
- Real-time Regulation Updates
- Compliance Dashboard
- Multi-document Citation Support
- AI Compliance Report Generation

---

# 👨‍💻 Team

Built as a hackathon project to simplify financial compliance using Artificial Intelligence and Retrieval-Augmented Generation.

---

# 📜 License

This project is intended for educational and hackathon purposes.
