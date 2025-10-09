"""
Persistent logging utilities.

This module defines a simple logger that writes structured events to
a JSON lines file.  Each event includes a timestamp, type and data.
The logs can be used for audits, operator dashboards and historical
analysis.  The logger avoids external dependencies by using the
standard library only.
"""

from __future__ import annotations

import json
import time
from typing import Any, Dict, List


class PersistentLogger:
    """Write log events to a JSON lines file on disk."""

    def __init__(self, filename: str = "logs.jsonl"):
        self.filename = filename

    def log_event(self, event_type: str, data: Dict[str, Any]) -> None:
        entry = {
            "timestamp": time.time(),
            "type": event_type,
            "data": data,
        }
        with open(self.filename, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")

    def get_events(self, event_type: str | None = None) -> List[Dict[str, Any]]:
        events = []
        try:
            with open(self.filename, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        if event_type is None or entry.get("type") == event_type:
                            events.append(entry)
                    except json.JSONDecodeError:
                        continue
        except FileNotFoundError:
            return []
        return events