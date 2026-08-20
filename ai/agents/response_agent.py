"""
Response Agent
---------------
Orchestrates reason_agent + retention_agent into the final payload the
backend/frontend expects, and is responsible for the shape/contract of
that payload staying stable even if the underlying agents change.
"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from agents.reason_agent import explain
from agents.retention_agent import recommend


def build_response(probability: float, factors: list, profile: dict) -> dict:
    summary = explain(probability, factors)
    offers = recommend(probability, factors, profile)

    return {
        "probability": probability,
        "factors": factors,
        "summary": summary,
        "offers": offers,
    }
