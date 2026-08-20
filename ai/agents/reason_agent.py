"""
Reason Agent
------------
Takes the raw ML output (probability + factor importances) and turns it
into a short, human-readable explanation of *why* this customer is at risk.

Falls back to a template-based summary when no Gemini key is configured,
so the pipeline always returns something sensible.
"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from gemini import generate

SYSTEM_INSTRUCTION = (
    "You are a churn-analysis assistant for a telecom company. Given a customer's "
    "churn probability and the top factors driving it, write a concise, plain-English "
    "explanation (2-3 sentences) a customer-success rep can read in five seconds. "
    "No jargon, no bullet points, just prose."
)


def _fallback_summary(probability: float, factors: list) -> str:
    level = "high" if probability >= 0.66 else "medium" if probability >= 0.33 else "low"
    top = factors[0]["name"] if factors else "their overall usage pattern"
    return (
        f"This customer has a {level} churn risk ({round(probability * 100)}%), "
        f"driven mainly by {top.lower()}. Reviewing their plan and engagement history "
        f"is recommended before their next renewal."
    )


def explain(probability: float, factors: list) -> str:
    factor_lines = "\n".join(f"- {f['name']}: impact {f['impact']}, pushes risk {f['direction']}" for f in factors)
    prompt = (
        f"Churn probability: {round(probability * 100)}%\n"
        f"Top factors:\n{factor_lines}\n\n"
        "Write the explanation now."
    )
    text = generate(prompt, SYSTEM_INSTRUCTION)
    return text.strip() if text else _fallback_summary(probability, factors)
