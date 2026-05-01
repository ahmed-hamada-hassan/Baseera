# =============================================================================
# pipeline.py
# =============================================================================
# Pipeline Orchestrator
# -----------------------------------------------------------------------------
# This is the single entry point for running the full OCR pipeline.
# It chains Tasks 1 → 2 → 3 in order and is called by both run_dummy.py
# and run_live.py.  Neither runner contains any business logic — they only
# prepare the image and credentials, then hand off to process_receipt() here.
#
# Call graph:
#   process_receipt(image, api_key, jwt_token)
#       └── task1_ocr.extract_receipt_data()       → gemini_data dict
#       └── task2_payload.format_api_payload()      → api_payload dict
#       └── task2_payload.post_transaction_to_api() → (dry-run / live POST)
#       └── task3_aggregator.update_aggregated_totals() → updates JSON ledger
# =============================================================================

import json
from typing import Any

from PIL import Image

from task1_ocr      import extract_receipt_data
from task2_payload  import format_api_payload, post_transaction_to_api
from task3_aggregator import update_aggregated_totals


# -----------------------------------------------------------------------------
# MAIN PIPELINE FUNCTION
# -----------------------------------------------------------------------------

def process_receipt(
    image: Image.Image,
    api_key: str,
    jwt_token: str = "DUMMY_JWT",
) -> dict[str, Any]:
    """
    Execute the full receipt OCR pipeline end-to-end.

    Step 1 — OCR Extraction:
        Sends the receipt image to Gemini Vision and receives a structured
        JSON object containing merchant, category, date, total, and items.

    Step 2 — Payload Formatting:
        Generates a UUID, computes micro-category subtotals, and assembles
        the API payload in the exact schema the backend expects.

    Step 2b — API Post:
        POSTs the payload to the backend OCR endpoint.
        (Currently dry-run — see task2_payload.py to activate live posting.)

    Step 3 — Aggregator:
        Adds this receipt's totals to the cumulative spending ledger on disk.

    Args:
        image:     PIL Image object of the receipt.
                   Provided by run_dummy.py (local file) or run_live.py (remote fetch).
        api_key:   Google Gemini API key.
                   ✏️  Load from os.environ["GEMINI_API_KEY"] — never hard-code.
        jwt_token: Bearer token for the backend POST request.
                   ✏️  Load from os.environ["BACKEND_JWT"] in run_live.py.

    Returns:
        dict: The fully-formed API payload that was (or would be) sent to the
              backend.  Useful for logging, testing, or chaining further steps.
    """
    _print_section_header("RECEIPT OCR PIPELINE — START")

    # ── Task 1: Gemini Vision OCR ─────────────────────────────────────────────
    print("\n── Step 1/3: OCR Extraction ──────────────────────────────────────")
    gemini_data = extract_receipt_data(image, api_key)

    # ── Task 2a: Build API payload ────────────────────────────────────────────
    print("\n── Step 2/3: Payload Formatting ──────────────────────────────────")
    api_payload = format_api_payload(gemini_data)
    print(f"[Pipeline] Payload assembled:\n{json.dumps(api_payload, indent=2, ensure_ascii=False)}")

    # ── Task 2b: POST to backend ──────────────────────────────────────────────
    post_transaction_to_api(api_payload, jwt_token)

    # ── Task 3: Update cumulative spending ledger ─────────────────────────────
    print("\n── Step 3/3: Aggregator ──────────────────────────────────────────")

    # Recover the micro-category subtotals from the stringified rawAiData field
    raw_ai_object = json.loads(api_payload["rawAiData"])
    micro_totals  = raw_ai_object["categoryTotals"]

    update_aggregated_totals(
        main_category              = api_payload["category"],
        total_amount               = api_payload["amount"],
        micro_category_totals_dict = micro_totals,
    )

    _print_section_header("RECEIPT OCR PIPELINE — COMPLETE")

    return api_payload


# -----------------------------------------------------------------------------
# INTERNAL UTILITY
# -----------------------------------------------------------------------------

def _print_section_header(title: str) -> None:
    """Print a clearly visible section divider for console readability."""
    width = 62
    print("\n" + "═" * width)
    print(f"  {title}")
    print("═" * width)
