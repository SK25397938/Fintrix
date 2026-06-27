import os
from pathlib import Path


def load_env(root_dir: Path) -> None:
    for env_path in (root_dir / ".env", root_dir / ",env", root_dir / "Backend" / ".env"):
        if not env_path.exists():
            continue
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def get_mistral_api_key() -> str | None:
    return (
        os.environ.get("MISTRAL_API_KEY")
        or os.environ.get("MISTRAL_KEY")
        or os.environ.get("MISTRALAI_API_KEY")
    )


def get_mistral_model() -> str:
    return os.environ.get("MISTRAL_MODEL", "mistral-small-latest")
