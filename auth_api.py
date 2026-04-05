"""
Auth API: POST /register, POST /login.
Stores users in SQLite (users.db) with PBKDF2 password hashes.
"""

from __future__ import annotations

import hashlib
import secrets
import sqlite3
from pathlib import Path
from typing import Literal

from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

DB_PATH = Path(__file__).resolve().parent / "users.db"

router = APIRouter(tags=["auth"])


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_auth_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY COLLATE NOCASE,
                password_hash BLOB NOT NULL,
                salt BLOB NOT NULL,
                role TEXT NOT NULL,
                display_name TEXT DEFAULT ''
            )
            """
        )
        conn.commit()
        cols = {row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
        if "display_name" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN display_name TEXT DEFAULT ''")
            conn.commit()


def _hash_password(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        120_000,
    )


class RegisterBody(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=4, max_length=256)
    role: Literal["doctor", "user"]
    name: str = Field(default="", max_length=120)


class LoginBody(BaseModel):
    email: str = Field(..., min_length=1, max_length=254)
    password: str = Field(..., min_length=1, max_length=256)
    role: Literal["doctor", "user"]


@router.post("/register")
def register(body: RegisterBody) -> JSONResponse:
    init_auth_db()
    email = body.email.strip().lower()
    if not email or "@" not in email:
        return JSONResponse(
            {"success": False, "message": "Invalid email", "role": None},
            status_code=400,
        )

    salt = secrets.token_bytes(16)
    pw_hash = _hash_password(body.password, salt)

    display_name = (body.name or "").strip()[:120]

    try:
        with _connect() as conn:
            conn.execute(
                "INSERT INTO users (email, password_hash, salt, role, display_name) VALUES (?, ?, ?, ?, ?)",
                (email, pw_hash, salt, body.role, display_name),
            )
            conn.commit()
    except sqlite3.IntegrityError:
        return JSONResponse(
            {
                "success": False,
                "message": "Email already registered",
                "role": None,
            },
            status_code=409,
        )

    return JSONResponse(
        {
            "success": True,
            "message": "Account created",
            "role": body.role,
        }
    )


@router.post("/login")
def login(body: LoginBody) -> JSONResponse:
    init_auth_db()
    email = body.email.strip().lower()

    with _connect() as conn:
        row = conn.execute(
            "SELECT password_hash, salt, role, display_name FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if row is None:
        return JSONResponse(
            {
                "success": False,
                "message": "Invalid email or password",
                "role": None,
            },
            status_code=401,
        )

    stored_hash = row["password_hash"]
    salt = row["salt"]
    role_db: str = row["role"]
    display_name = ""
    dn = row["display_name"]
    if dn is not None:
        display_name = str(dn)

    if isinstance(stored_hash, memoryview):
        stored_hash = stored_hash.tobytes()
    if isinstance(salt, memoryview):
        salt = salt.tobytes()

    candidate = _hash_password(body.password, salt)
    if not secrets.compare_digest(candidate, stored_hash):
        return JSONResponse(
            {
                "success": False,
                "message": "Invalid email or password",
                "role": None,
            },
            status_code=401,
        )

    if role_db != body.role:
        return JSONResponse(
            {
                "success": False,
                "message": f"This account is registered as a {role_db}, not a {body.role}",
                "role": None,
            },
            status_code=403,
        )

    return JSONResponse(
        {
            "success": True,
            "message": "Login successful",
            "role": role_db,
            "name": display_name,
        }
    )


def setup_auth(app) -> None:
    """Register auth routes and CORS for the local Vite dev server."""
    init_auth_db()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://127.0.0.1:3000",
            "http://localhost:3000",
            "http://127.0.0.1:4200",
            "http://localhost:4200",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router)
