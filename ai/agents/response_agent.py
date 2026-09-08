"""
Response Agent
--------------
Public entry point for the AI pipeline.
Delegates to the LangGraph churn pipeline (agents/graph.py) which runs:

  score → explain → recommend → END

The response shape is unchanged so the FastAPI endpoint and frontend
don't need any modifications.
"""
from agents.graph import run_pipeline


def build_response(probability: float, factors: list, profile: dict) -> dict:
    return run_pipeline(probability, factors, profile)
