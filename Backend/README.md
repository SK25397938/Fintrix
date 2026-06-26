# Fintrix FastAPI Backend

This backend powers the existing Fintrix frontend and connects it to the local `sebi` folder.

## Run locally

```powershell
cd C:\Users\user\OneDrive\Documents\Fintrix\Backend
py -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If venv setup fails on Windows, use the same Python installation directly:

```powershell
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Then run the frontend from `Frontend\fintrix-web`:

```powershell
npm.cmd run dev
```

The Next.js proxy already forwards `/api/...` calls to `http://127.0.0.1:8000` in development.

## Useful endpoints

- `GET /api/health`
- `GET /api/sebi/documents`
- `GET /api/sebi/search?q=insider trading`
- `GET /api/docs/{filename}`
- `POST /api/ai/session/message`
- `POST /api/rules/evaluate`
- `POST /api/what-if`
