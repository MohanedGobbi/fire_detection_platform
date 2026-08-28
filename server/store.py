"""
SQLite-backed storage for user-submitted fire reports.

Kept separate from detect_server.py so the HTTP layer stays a thin router.
"""

from __future__ import annotations

import sqlite3
import time
import uuid
from pathlib import Path

DB_PATH = Path(__file__).resolve().with_name("firedetect.db")
UPLOADS_DIR = Path(__file__).resolve().with_name("uploads") / "reports"

VALID_STATUSES = {"new", "acknowledged", "false_alarm"}


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                description TEXT NOT NULL,
                contact TEXT,
                photo_filename TEXT,
                status TEXT NOT NULL DEFAULT 'new',
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
            """
        )


def _row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "lat": row["lat"],
        "lng": row["lng"],
        "description": row["description"],
        "contact": row["contact"],
        "photoFilename": row["photo_filename"],
        "status": row["status"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def insert_report(
    lat: float,
    lng: float,
    description: str,
    contact: str | None,
    photo_filename: str | None,
) -> dict:
    report_id = f"RPT-{uuid.uuid4().hex[:10]}"
    now = time.time()
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO reports
                (id, lat, lng, description, contact, photo_filename, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?)
            """,
            (report_id, lat, lng, description, contact, photo_filename, now, now),
        )
        row = conn.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
    return _row_to_dict(row)


def list_reports() -> list[dict]:
    with _connect() as conn:
        rows = conn.execute("SELECT * FROM reports ORDER BY created_at DESC").fetchall()
    return [_row_to_dict(r) for r in rows]


def update_report_status(report_id: str, status: str) -> dict | None:
    if status not in VALID_STATUSES:
        raise ValueError(f"invalid status: {status}")
    with _connect() as conn:
        cur = conn.execute(
            "UPDATE reports SET status = ?, updated_at = ? WHERE id = ?",
            (status, time.time(), report_id),
        )
        if cur.rowcount == 0:
            return None
        row = conn.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
    return _row_to_dict(row)
