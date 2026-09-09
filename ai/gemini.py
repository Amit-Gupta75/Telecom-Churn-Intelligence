"""
Thin wrapper around the Gemini API so the agents don't each re-implement
client setup, retries, and JSON parsing.

If GEMINI_API_KEY is not set, generate() falls back to a deterministic
rule-based response so the rest of the pipeline still works offline / in demos.
"""

import os
import json

from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-3.8-flash"

_configured = False
client = None

if API_KEY and API_KEY != "your_gemini_api_key_here":
    client = genai.Client(api_key=API_KEY)
    _configured = True


def generate(
    prompt: str,
    system_instruction: str = "",
    json_mode: bool = False
) -> str:
    """Call Gemini with a prompt. Returns raw text (or JSON text if json_mode).

    Never raises — any failure falls back to an empty string so callers
    can use their rule-based defaults.
    """

    if not _configured:
        return ""

    try:
        full_input = prompt

        if system_instruction:
            full_input = (
                f"System instructions:\n{system_instruction}\n\n"
                f"User request:\n{prompt}"
            )

        response = client.interactions.create(
            model=MODEL_NAME,
            input=full_input,
        )

        return response.output_text or ""

    except Exception as e:
        print(
            f"[gemini] generation failed, "
            f"falling back to rule-based default: {e}"
        )
        return ""


def generate_json(prompt: str, system_instruction: str = "") -> dict:
    text = generate(
        prompt,
        system_instruction=system_instruction,
        json_mode=True
    )

    if not text:
        return {}

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}