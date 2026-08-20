"""
Thin wrapper around the Gemini API so the agents don't each re-implement
client setup, retries, and JSON parsing.

If GEMINI_API_KEY is not set, `generate()` falls back to a deterministic
rule-based response so the rest of the pipeline still works offline / in demos.
"""

import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-3.6-flash"

_configured = False
client = None

if API_KEY and API_KEY != "your_gemini_api_key_here":
    client = genai.Client(api_key=API_KEY)
    _configured = True


def generate(prompt: str, system_instruction: str = "", json_mode: bool = False) -> str:
    """Call Gemini with a prompt. Returns raw text (or JSON text if json_mode).
    Never raises — any failure (bad key, deprecated API, network issue) falls
    back to an empty string so callers can use their rule-based defaults.
    """
    if not _configured:
        return ""

    try:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction or None,
            response_mime_type="application/json" if json_mode else None,
        )

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=config,
        )

        return response.text

    except Exception as e:
        print(f"[gemini] generation failed, falling back to rule-based default: {e}")
        return ""


def generate_json(prompt: str, system_instruction: str = "") -> dict:
    text = generate(prompt, system_instruction, json_mode=True)

    if not text:
        return {}

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}