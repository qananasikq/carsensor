import re
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(title="carsensor-python-service", version="1.0.0")


class NormalizeRequest(BaseModel):
    value: str = ""


class NormalizeResponse(BaseModel):
    raw: str
    normalized: str
    tokens: List[str]


def normalize_text(value: str) -> str:
    text = (value or "").strip().lower()
    text = text.replace("ё", "е")
    text = re.sub(r"[^\w\s-]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text).strip()
    return text


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "python-search-normalizer"
    }


@app.post("/normalize-search", response_model=NormalizeResponse)
def normalize_search(payload: NormalizeRequest) -> NormalizeResponse:
    normalized = normalize_text(payload.value)
    tokens = [token for token in normalized.split(" ") if token]

    return NormalizeResponse(
        raw=payload.value,
        normalized=normalized,
        tokens=tokens,
    )
