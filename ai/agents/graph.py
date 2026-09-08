"""
LangGraph Churn Pipeline
------------------------
Defines a stateful graph that runs the full churn analysis pipeline:

  [score] → [explain] → [recommend] → END

Each node receives the full ChurnState TypedDict and adds its output to it.
The graph replaces the manual function-call chain in response_agent.py with
an explicit, inspectable, and easily extensible directed graph.

Why LangGraph here?
- State is passed explicitly between nodes — no hidden coupling
- Easy to add new nodes (e.g. escalation, email draft) without touching others
- Conditional edges let us skip Gemini calls for low-risk customers (saves cost)
- The graph can be visualised, traced, and tested node-by-node
"""

from typing import TypedDict
from langgraph.graph import StateGraph, END

from agents.reason_agent import explain, _fallback_summary
from agents.retention_agent import recommend, _fallback_offers


# ── State schema ──────────────────────────────────────────────────────────

class ChurnState(TypedDict):
    # Inputs (set before graph runs)
    probability: float
    factors: list
    profile: dict

    # Outputs (filled by nodes)
    summary: str
    offers: list
    risk_level: str          # "high" | "medium" | "low"


# ── Nodes ─────────────────────────────────────────────────────────────────

def node_score(state: ChurnState) -> ChurnState:
    """
    Classifies the churn probability into a risk level.
    This drives the conditional edge — low-risk customers skip Gemini.
    """
    p = state["probability"]
    level = "high" if p >= 0.66 else "medium" if p >= 0.33 else "low"
    return {**state, "risk_level": level}


def node_explain(state: ChurnState) -> ChurnState:
    """Calls reason_agent to produce a plain-English churn explanation."""
    summary = explain(state["probability"], state["factors"])
    return {**state, "summary": summary}


def node_explain_fallback(state: ChurnState) -> ChurnState:
    """
    For low-risk customers: use the rule-based summary instead of calling
    Gemini — faster and cheaper when the risk is already minimal.
    """
    summary = _fallback_summary(state["probability"], state["factors"])
    return {**state, "summary": summary}


def node_recommend(state: ChurnState) -> ChurnState:
    """Calls retention_agent to produce up to 3 ranked retention offers."""
    offers = recommend(state["probability"], state["factors"], state["profile"])
    return {**state, "offers": offers}


def node_recommend_fallback(state: ChurnState) -> ChurnState:
    """
    For low-risk customers: use rule-based offers instead of Gemini.
    """
    offers = _fallback_offers(state["factors"])
    return {**state, "offers": offers}


# ── Conditional routing ───────────────────────────────────────────────────

def route_by_risk(state: ChurnState) -> str:
    """
    After scoring, decide which explain node to run:
    - high / medium → call Gemini for a personalised explanation
    - low            → use the fast rule-based fallback
    """
    return "explain_gemini" if state["risk_level"] in ("high", "medium") else "explain_fallback"


def route_recommend(state: ChurnState) -> str:
    """
    After explaining, decide which recommend node to run.
    Same logic: only call Gemini for high/medium risk.
    """
    return "recommend_gemini" if state["risk_level"] in ("high", "medium") else "recommend_fallback"


# ── Build graph ───────────────────────────────────────────────────────────

def build_graph() -> StateGraph:
    graph = StateGraph(ChurnState)

    graph.add_node("score",              node_score)
    graph.add_node("explain_gemini",     node_explain)
    graph.add_node("explain_fallback",   node_explain_fallback)
    graph.add_node("recommend_gemini",   node_recommend)
    graph.add_node("recommend_fallback", node_recommend_fallback)

    graph.set_entry_point("score")

    # After scoring, branch based on risk level
    graph.add_conditional_edges(
        "score",
        route_by_risk,
        {
            "explain_gemini":   "explain_gemini",
            "explain_fallback": "explain_fallback",
        },
    )

    # After explaining, branch to the matching recommend node
    graph.add_conditional_edges(
        "explain_gemini",
        route_recommend,
        {
            "recommend_gemini":   "recommend_gemini",
            "recommend_fallback": "recommend_fallback",
        },
    )
    graph.add_conditional_edges(
        "explain_fallback",
        route_recommend,
        {
            "recommend_gemini":   "recommend_gemini",
            "recommend_fallback": "recommend_fallback",
        },
    )

    graph.add_edge("recommend_gemini",   END)
    graph.add_edge("recommend_fallback", END)

    return graph.compile()


# Singleton — compiled once at import time
churn_pipeline = build_graph()


# ── Public API ────────────────────────────────────────────────────────────

def run_pipeline(probability: float, factors: list, profile: dict) -> dict:
    """
    Run the full LangGraph churn pipeline and return the final state
    as the response dict expected by the FastAPI endpoint.
    """
    initial_state: ChurnState = {
        "probability": probability,
        "factors": factors,
        "profile": profile,
        "summary": "",
        "offers": [],
        "risk_level": "",
    }

    final_state = churn_pipeline.invoke(initial_state)

    return {
        "probability": final_state["probability"],
        "factors":     final_state["factors"],
        "summary":     final_state["summary"],
        "offers":      final_state["offers"],
        "risk_level":  final_state["risk_level"],
    }
