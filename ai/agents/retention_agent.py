
"""
Retention Agent
---------------

Given the churn probability, risk factors, and the customer's profile,
recommends up to THREE ranked retention offers (High / Medium / Low
priority), each with a category, description, and an estimated churn-risk
reduction — mirroring how a retention team would triage a customer.

Falls back to a rule-based offer catalogue when Gemini isn't configured or
its response doesn't come back in the expected shape.
"""

import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from gemini import generate_json

SYSTEM_INSTRUCTION = (
    "You are a retention strategist for a telecom company. Given a customer's churn "
    "risk, its drivers, and their profile, recommend UP TO THREE concrete retention "
    "offers, ranked by expected impact. Respond as JSON: "
    '{"offers": [{"priority": "High" | "Medium" | "Low", "category": "short 2-3 word '
    'category, e.g. \'Contract Upgrade\'", "title": "short offer name", "description": '
    '"1-2 sentences on what the customer gets and why it targets their specific risk '
    'drivers", "riskReduction": integer percent estimate of churn-risk reduction}]}. '
    "Order offers High to Low priority. Keep offers realistic for a telecom provider."
)

# Rule-based fallback catalogue, keyed by the risk-factor name that
# justifies the offer (matches the `name` field predict.py returns).
FALLBACK_OFFERS = {

    "Contract type": {
        "category": "Contract Upgrade",
        "title": "Offer 10% discount for 1-year contract",
        "description": "Customer is on a month-to-month plan — the highest churn-risk segment. "
                       "Offer 10% off the monthly bill for switching to a 1-year contract.",
        "riskReduction": 35,
    },

    "Tech support": {
        "category": "Service Upgrade",
        "title": "Offer 3 months free Tech Support",
        "description": "Customer lacks tech support. Proactively offer 3 months free to improve "
                       "experience and reduce frustration-driven churn.",
        "riskReduction": 15,
    },

    "Payment method": {
        "category": "Payment Incentive",
        "title": "$5/mo discount for auto-pay enrollment",
        "description": "Electronic-check users show higher churn rates. Offer $5/month for "
                       "switching to automatic bank transfer or credit card.",
        "riskReduction": 8,
    },

    "Monthly charges": {
        "category": "Plan Optimization",
        "title": "Right-size plan review",
        "description": "Monthly charges are high relative to typical usage. A free plan audit "
                       "can move them to a lower-cost tier that still covers their needs.",
        "riskReduction": 12,
    },

    "Internet service": {
        "category": "Service Reliability",
        "title": "Fiber reliability credit",
        "description": "Fiber customers without add-on protections show elevated churn. Offer a "
                       "service credit plus a proactive line-quality check.",
        "riskReduction": 10,
    },

    "Online security": {
        "category": "Service Upgrade",
        "title": "Free 6-month Online Security add-on",
        "description": "Customer has no online security add-on, a segment with above-average "
                       "churn. Offer it free for 6 months to increase stickiness.",
        "riskReduction": 9,
    },

    "Online backup": {
        "category": "Service Upgrade",
        "title": "Free Online Backup trial",
        "description": "Bundling backup/security add-ons correlates with longer tenure. Offer a "
                       "free 3-month trial to increase switching costs.",
        "riskReduction": 7,
    },

    "Device protection": {
        "category": "Service Upgrade",
        "title": "Device Protection at 50% off",
        "description": "Customer has no device protection plan. A discounted add-on increases "
                       "perceived value without a large revenue hit.",
        "riskReduction": 6,
    },

    "Streaming TV": {
        "category": "Entertainment Bundle",
        "title": "1 month free Streaming TV",
        "description": "Entertainment add-ons correlate with lower churn. A free trial month can "
                       "nudge adoption and stickiness.",
        "riskReduction": 6,
    },

    "Streaming movies": {
        "category": "Entertainment Bundle",
        "title": "1 month free Streaming Movies",
        "description": "Entertainment add-ons correlate with lower churn. A free trial month can "
                       "nudge adoption and stickiness.",
        "riskReduction": 6,
    },

    "Paperless billing": {
        "category": "Billing Experience",
        "title": "Billing preferences check-in",
        "description": "Paperless-billing customers show higher churn in this segment, often tied "
                       "to billing confusion. A quick check-in call can surface the real issue.",
        "riskReduction": 5,
    },

    "Tenure": {
        "category": "Loyalty Reward",
        "title": "New-customer loyalty credit",
        "description": "Early-tenure customers churn most. A one-time bill credit at month 3 "
                       "reinforces the value of staying.",
        "riskReduction": 14,
    },

    "Total charges": {
        "category": "Loyalty Reward",
        "title": "Lifetime-value loyalty credit",
        "description": "A one-time credit recognizing their total spend to date, reinforcing "
                       "their relationship with the brand.",
        "riskReduction": 8,
    },

    "default": {
        "category": "Retention Call",
        "title": "Loyalty check-in call",
        "description": "No single dominant driver — a direct conversation from a retention "
                       "specialist surfaces the real reason before offering a discount.",
        "riskReduction": 5,
    },
}

PRIORITY_ORDER = ["High", "Medium", "Low"]


def _fallback_offers(factors: list) -> list:

    # Prefer factors that are actually pushing risk UP — those are the
    # ones an offer can meaningfully counteract.
    actionable = [f for f in factors if f.get("direction") == "up"]
    actionable = actionable or factors

    chosen, seen_categories = [], set()

    for f in actionable:
        template = FALLBACK_OFFERS.get(f["name"])

        if not template or template["category"] in seen_categories:
            continue

        chosen.append(template)
        seen_categories.add(template["category"])

        if len(chosen) == 3:
            break

    # Pad with the generic call if fewer than 3 distinct offers were found.
    while len(chosen) < 3:
        filler = FALLBACK_OFFERS["default"]

        if filler["category"] in seen_categories and len(chosen) > 0:
            break

        chosen.append(filler)
        seen_categories.add(filler["category"])

    return [
        {
            "priority": PRIORITY_ORDER[i] if i < 3 else "Low",
            "category": o["category"],
            "title": o["title"],
            "description": o["description"],
            "riskReduction": o["riskReduction"],
        }
        for i, o in enumerate(chosen)
    ]


def _validate(offers) -> bool:

    if not isinstance(offers, list) or not offers:
        return False

    required = {
        "priority",
        "category",
        "title",
        "description",
        "riskReduction"
    }

    return all(
        isinstance(o, dict) and required.issubset(o.keys())
        for o in offers
    )


def recommend(
    probability: float,
    factors: list,
    profile: dict
) -> list:

    factor_lines = "\n".join(
        f"- {f['name']}: impact {f['impact']}, pushes risk {f['direction']}"
        for f in factors
    )

    prompt = (
        f"Churn probability: {round(probability * 100)}%\n"
        f"Top factors:\n{factor_lines}\n"
        f"Customer profile: {json.dumps(profile)}\n\n"
        "Return the JSON offers now."
    )

    # FIX: system instruction explicitly passed by keyword
    result = generate_json(
        prompt,
        system_instruction=SYSTEM_INSTRUCTION
    )

    offers = result.get("offers") if isinstance(result, dict) else None

    if _validate(offers):
        return offers[:3]

    return _fallback_offers(factors)

