# backend/app/models.py
from typing import Dict, List

# In‑memory “database”
_notes: List[Dict] = []  # each note is a dict with id, title, body


def add_note(title: str, body: str) -> Dict:
    note_id = len(_notes) + 1
    note = {"id": note_id, "title": title, "body": body}
    _notes.append(note)
    return note


def get_all_notes() -> List[Dict]:
    return _notes
