import json
from pathlib import Path


class SebiRepository:
    def __init__(self, sebi_root: Path):
        self.sebi_root = sebi_root
        self.manifest_path = sebi_root / "manifest.json"

    def list_documents(self) -> list[dict]:
        manifest_documents = self._manifest_documents()
        indexed = []

        for document in manifest_documents:
            file_path = self.resolve_document_path(document)
            indexed.append(
                {
                    **document,
                    "filename": file_path.name if file_path else None,
                    "available": bool(file_path and file_path.exists()),
                    "url": f"/api/docs/{file_path.name}" if file_path else None,
                }
            )

        known_names = {item.get("filename") for item in indexed}
        for pdf_path in sorted(self.sebi_root.glob("*/*.[pP][dD][fF]")):
            if pdf_path.name in known_names:
                continue
            indexed.append(
                {
                    "id": pdf_path.stem,
                    "category": pdf_path.parent.name,
                    "title": pdf_path.stem,
                    "official_url": None,
                    "published_date": None,
                    "priority": "normal",
                    "status": "available",
                    "filename": pdf_path.name,
                    "available": True,
                    "url": f"/api/docs/{pdf_path.name}",
                }
            )

        return indexed

    def search(self, query: str, limit: int = 5) -> list[dict]:
        terms = [term.lower() for term in query.split() if len(term) > 2]
        if not terms:
            return self.list_documents()[:limit]

        scored = []
        for document in self.list_documents():
            haystack = " ".join(
                str(document.get(field) or "")
                for field in ("title", "category", "published_date", "priority", "id")
            ).lower()
            score = sum(haystack.count(term) for term in terms)
            if score:
                scored.append((score, document))

        scored.sort(key=lambda item: (-item[0], item[1].get("published_date") or ""))
        return [document for _, document in scored[:limit]]

    def find_pdf_by_name(self, filename: str) -> Path | None:
        safe_name = Path(filename).name
        for path in self.sebi_root.glob("*/*"):
            if path.is_file() and path.name.lower() == safe_name.lower():
                return path
        return None

    def resolve_document_path(self, document: dict) -> Path | None:
        suggested = document.get("suggested_file") or ""
        name = Path(suggested).name
        if not name:
            return None
        return self.find_pdf_by_name(name) or self.sebi_root / document.get("category", "") / name

    def _manifest_documents(self) -> list[dict]:
        if not self.manifest_path.exists():
            return []
        with self.manifest_path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        return payload.get("documents", [])
