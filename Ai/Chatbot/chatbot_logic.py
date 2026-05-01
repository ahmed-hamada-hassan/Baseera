# chatbot_logic.py
# The Gemini Core: encapsulates all AI model interaction logic.
# Handles prompt construction, structured JSON output enforcement, and response parsing.

import json
from google import genai
from google.genai import types
import config

# --- Module-level initialization ---
# The API key is read from the .env file via config.py — never hardcoded.
if not config.GEMINI_API_KEY:
    raise EnvironmentError(
        "GEMINI_API_KEY is not set. "
        "Please add it to your .env file before starting the server."
    )

# NEW SDK: Initialize a client instead of using a global configure method
client = genai.Client(api_key=config.GEMINI_API_KEY)

# JSON schema contract enforced on every AI response.
# This is documented here as the single source of truth.
_RESPONSE_SCHEMA_INSTRUCTION = """
You MUST respond with ONLY a valid JSON object that strictly follows this schema.
Do not include any markdown, code fences, or extra text outside the JSON object.

Schema:
{
  "textReply": "Your concise, actionable financial advice as a string.",
  "chartData": {
    "labels": ["Category A", "Category B"],
    "values": [100.0, 200.0]
  }
}

Rules:
- "textReply" must always be a non-empty string.
- "chartData.labels" must be an array of strings.
- "chartData.values" must be an array of floats that correspond to the labels.
- If no chart data is relevant to the question, return empty arrays for both labels and values.
"""


def generate_response(user_message: str, financial_context: dict) -> dict:
    """
    Sends a user message to Gemini with full financial context and returns
    a structured dictionary response.
    """
    system_instruction = _build_system_instruction(financial_context)

    # We bypass _create_model and send the instruction directly to our chat helper
    raw_response_text = _send_message(system_instruction, user_message)
    return _parse_response(raw_response_text)


# --- Private helpers ---

def _build_system_instruction(financial_context: dict) -> str:
    """
    Constructs the full system prompt.
    """
    context_as_string = json.dumps(financial_context, indent=2)

    return (
        f"{config.SYSTEM_PERSONA}\n\n"
        f"--- USER FINANCIAL CONTEXT ---\n"
        f"The following is the user's current financial data. Base ALL advice on this data only:\n"
        f"{context_as_string}\n\n"
        f"--- OUTPUT FORMAT CONTRACT ---\n"
        f"{_RESPONSE_SCHEMA_INSTRUCTION}"
    )


def _send_message(system_instruction: str, user_message: str) -> str:
    """
    Starts a chat session using the new Client and sends the user message.
    """
    try:
        # NEW SDK: Config is built using types.GenerateContentConfig
        gen_config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
        )

        # NEW SDK: Chats are created from the client
        chat_session = client.chats.create(
            model=config.GEMINI_MODEL_NAME,
            config=gen_config
        )
        response = chat_session.send_message(user_message)
        return response.text
    except Exception as e:
        raise RuntimeError(f"Gemini API call failed: {e}") from e


def _parse_response(raw_text: str) -> dict:
    """
    Parses the AI's raw text output into a Python dictionary.
    """
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"AI returned a response that is not valid JSON. "
            f"Raw response: '{raw_text}'. Error: {e}"
        ) from e