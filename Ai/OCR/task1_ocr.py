# =============================================================================
# task1_ocr.py
# =============================================================================
# Task 1 — Gemini Vision OCR Extraction
# -----------------------------------------------------------------------------
# Responsibilities:
#   • Build the structured extraction prompt (categories injected from constants)
#   • Send a receipt image to Gemini Vision and receive a parsed JSON response
#   • Validate that the response matches the required schema and category lists
# =============================================================================

import json
import io
from typing import Any

from google import genai
from google.genai import types as genai_types
from PIL import Image

from constants import GEMINI_MODEL, MAIN_CATEGORIES, MICRO_CATEGORIES


# -----------------------------------------------------------------------------
# PROMPT BUILDER
# -----------------------------------------------------------------------------

def build_extraction_prompt() -> str:
    """
    Construct the system instruction sent to Gemini alongside the receipt image.

    The prompt explicitly injects the allowed category lists so Gemini's output
    can be deterministically validated against the same source-of-truth constants.
    We request ONLY a JSON object — no markdown fences, no preamble — so that
    `response_mime_type="application/json"` enforcement is fully effective.

    Returns:
        str: The complete prompt string to pass as the first content part.
    """
    main_cats  = json.dumps(MAIN_CATEGORIES)
    micro_cats = json.dumps(MICRO_CATEGORIES)

    return f"""
You are an expert receipt OCR engine for a FinTech application.
Analyze the receipt image and return ONLY a valid JSON object.
Do NOT include markdown backticks, explanations, or any text outside the JSON.

Required JSON structure:
{{
  "merchantName":    "<string — name of the store or restaurant>",
  "category":        "<exactly one value from {main_cats}>",
  "transactionDate": "<ISO 8601 datetime — if not on the receipt use current UTC time>",
  "amount":          <float — the final grand total charged to the customer>,
  "items": [
    {{
      "name":          "<item name as printed>",
      "price":         <float — price of this single item>,
      "microCategory": "<exactly one value from {micro_cats}>"
    }}
  ]
}}

Strict rules:
- "category" MUST be verbatim one of: {main_cats}
- Each "microCategory" MUST be verbatim one of: {micro_cats}
- "amount" is the grand total (after tax, fees, discounts) as a float.
- If the transaction date is unreadable, set it to the current UTC datetime in ISO 8601.
- List only items that are physically printed on the receipt — do not invent items.
- Taxes and service charges should appear as their own items in the items array.
"""


# -----------------------------------------------------------------------------
# OCR EXTRACTION
# -----------------------------------------------------------------------------

def extract_receipt_data(image: Image.Image, api_key: str) -> dict[str, Any]:
    """
    Send a PIL Image of a receipt to Gemini Vision and return parsed OCR data.

    Accepts a PIL Image directly so this function works with images sourced
    from both a local file (run_dummy.py) and a remote URL (run_live.py)
    without needing separate code paths here.

    Args:
        image:   A PIL Image object of the receipt (any format Pillow supports).
        api_key: Your Google Gemini API key.
                 ✏️  In production, load this from an environment variable:
                     os.environ["GEMINI_API_KEY"]
                 Never hard-code the key directly in source code.

    Returns:
        dict: Parsed OCR result matching the schema in build_extraction_prompt().
              Keys: merchantName, category, transactionDate, amount, items.

    Raises:
        ValueError: If Gemini returns malformed JSON or a schema/category violation.
    """
    # Initialise the Gemini client with the provided key
    client = genai.Client(api_key=api_key)

    # Convert the PIL Image to raw bytes so the SDK can send it as a Part
    img_buffer = io.BytesIO()
    image_format = image.format or "JPEG"           # Preserve original format; default JPEG
    image.save(img_buffer, format=image_format)
    image_bytes = img_buffer.getvalue()
    mime_type   = f"image/{image_format.lower()}"   # e.g. "image/jpeg"

    image_part = genai_types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

    print(f"[Task 1 | OCR] Sending image to Gemini ({GEMINI_MODEL}) …")

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[build_extraction_prompt(), image_part],
        config=genai_types.GenerateContentConfig(
            response_mime_type="application/json",  # Enforce strict JSON output
            temperature=0.1,                        # Low temp = deterministic transcription
        ),
    )

    raw_text = response.text.strip()

    # Parse JSON response from Gemini
    try:
        extracted: dict[str, Any] = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"[Task 1 | OCR] Gemini returned invalid JSON.\n"
            f"Parse error: {exc}\n"
            f"Raw response:\n{raw_text}"
        ) from exc

    # Validate schema and category values before passing data downstream
    _validate_gemini_response(extracted)

    print(f"[Task 1 | OCR] Extraction successful — merchant: '{extracted.get('merchantName')}'")
    return extracted


# -----------------------------------------------------------------------------
# RESPONSE VALIDATOR  (private helper)
# -----------------------------------------------------------------------------

def _validate_gemini_response(data: dict[str, Any]) -> None:
    """
    Guard that enforces schema completeness and category whitelist membership.

    Called immediately after JSON parsing so any upstream consumer of
    extract_receipt_data() can trust the dict it receives is fully valid.

    Args:
        data: The dict parsed from Gemini's JSON response.

    Raises:
        ValueError: On any missing key, invalid main category, or invalid
                    micro-category in any item.
    """
    # ── Top-level required keys ───────────────────────────────────────────────
    required_keys = {"merchantName", "category", "transactionDate", "amount", "items"}
    missing_keys  = required_keys - data.keys()

    if missing_keys:
        raise ValueError(
            f"[Task 1 | Validate] Gemini response is missing required keys: {missing_keys}"
        )

    # ── Main category whitelist check ─────────────────────────────────────────
    if data["category"] not in MAIN_CATEGORIES:
        raise ValueError(
            f"[Task 1 | Validate] Invalid main category: '{data['category']}'.\n"
            f"Must be one of: {MAIN_CATEGORIES}"
        )

    # ── Per-item field and micro-category checks ──────────────────────────────
    for idx, item in enumerate(data.get("items", [])):

        for field in ("name", "price", "microCategory"):
            if field not in item:
                raise ValueError(
                    f"[Task 1 | Validate] items[{idx}] is missing the '{field}' field."
                )

        if item["microCategory"] not in MICRO_CATEGORIES:
            raise ValueError(
                f"[Task 1 | Validate] items[{idx}] has invalid microCategory: "
                f"'{item['microCategory']}'.\nMust be one of: {MICRO_CATEGORIES}"
            )
