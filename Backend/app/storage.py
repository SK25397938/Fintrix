import json
from pathlib import Path
from threading import Lock
from typing import Any


class JsonStore:
    def __init__(self, path: Path, default: Any):
        self.path = path
        self.default = default
        self.lock = Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.write(default)

    def read(self) -> Any:
        with self.lock:
            try:
                with self.path.open("r", encoding="utf-8") as handle:
                    return json.load(handle)
            except (json.JSONDecodeError, FileNotFoundError):
                return self.default

    def write(self, data: Any) -> None:
        with self.lock:
            with self.path.open("w", encoding="utf-8") as handle:
                json.dump(data, handle, indent=2)
