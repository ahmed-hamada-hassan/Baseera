# =============================================================================
# task2_payload.py
# =============================================================================
# Task 2 — Internal Logic & API Payload Formatting
# -----------------------------------------------------------------------------
# Responsibilities:
#   • Generate a unique receiptId with uuid4
#   • Calculate per-micro-category subtotals from the items list
#   • Assemble the final API payload in the exact schema the backend expects
#   • Expose a (currently dry-run) function to POST the payload to the backend
# =============================================================================

import json
import uuid
# import requests  # ✏️  Uncomment this line when you are ready to go live
from datetime import datetime, timezone
from typing import Any

from constants import OCR_ENDPOINT, REQUEST_TIMEOUT_SECONDS


# -----------------------------------------------------------------------------
# MICRO-CATEGORY SUBTOTALS
# -----------------------------------------------------------------------------

def compute_micro_category_totals(items: list[dict[str, Any]]) -> dict[str, float]:
    """
    Aggregate item prices by micro-category for the current bill only.

    Only micro-categories that actually appear in this receipt's items list
    will be present in the returned dict — zero-value categories are omitted.
    The aggregator (task3) handles zero-initialisation of the global ledger.

    Args:
        items: The "items" list from the validated Gemini extraction result.
               Each item must have "price" (float) and "microCategory" (str).

    Returns:
        dict: micro-category name → rounded subtotal float (2 decimal places).
              e.g. {"Food Items": 30.50, "Beverages": 11.75, "Services & Fees": 5.60}

    Example:
        items = [
            {"name": "Burger", "price": 12.00, "microCategory": "Food Items"},
            {"name": "Coke",   "price":  3.50, "microCategory": "Beverages"},
            {"name": "Burger", "price": 12.00, "microCategory": "Food Items"},
        ]
        → {"Food Items": 24.00, "Beverages": 3.50}
    """
    totals: dict[str, float] = {}

    for item in items:
        micro_cat = item["microCategory"]
        price     = float(item.get("price", 0.0))
        totals[micro_cat] = round(totals.get(micro_cat, 0.0) + price, 2)

    return totals


# -----------------------------------------------------------------------------
# PAYLOAD FORMATTER
# -----------------------------------------------------------------------------

def format_api_payload(gemini_data: dict[str, Any]) -> dict[str, Any]:
    """
    Build the final payload object ready to be sent to the backend OCR endpoint.

    Schema produced (as required by the backend contract):
    {
        "amount":          float,
        "merchantName":    str,
        "category":        str,
        "transactionDate": str  (ISO 8601),
        "rawAiData":       str  (stringified JSON — see below)
    }

    rawAiData (stringified JSON) contains:
    {
        "receiptId":      str   (UUID v4),
        "items":          list  (the full items array from Gemini),
        "categoryTotals": dict  (micro-category → subtotal for THIS bill)
    }

    Args:
        gemini_data: Validated dict returned by task1_ocr.extract_receipt_data().

    Returns:
        dict: The fully-formed API payload.
    """
    # Generate a collision-proof unique ID for this receipt
    receipt_id = str(uuid.uuid4())

    items        = gemini_data.get("items", [])
    micro_totals = compute_micro_category_totals(items)

    # Ensure transactionDate is a valid ISO 8601 string.
    # Gemini should provide it, but we guard against empty/missing values.
    transaction_date: str = str(gemini_data.get("transactionDate", "")).strip()
    if not transaction_date:
        # Fall back to the current moment in UTC with timezone offset (+00:00)
        transaction_date = datetime.now(timezone.utc).isoformat()

    # ── Build the nested metadata object that becomes rawAiData ──────────────
    raw_ai_object: dict[str, Any] = {
        "receiptId":      receipt_id,
        "items":          items,
        "categoryTotals": micro_totals,
    }

    # ── Assemble the top-level payload ────────────────────────────────────────
    payload: dict[str, Any] = {
        "amount":          float(gemini_data.get("amount", 0.0)),
        "merchantName":    str(gemini_data.get("merchantName", "")),
        "category":        str(gemini_data.get("category", "")),
        "transactionDate": transaction_date,
        # rawAiData must be a JSON string, not a nested object — per backend spec
        "rawAiData":       json.dumps(raw_ai_object,ensure_ascii=False),
    }

    return payload


# -----------------------------------------------------------------------------
# API POST  (dry-run by default — activate for live use)
# -----------------------------------------------------------------------------

def post_transaction_to_api(payload: dict[str, Any], jwt_token: str) -> None:
    """
    POST the formatted receipt payload to the backend OCR endpoint.

    ── HOW TO GO LIVE ────────────────────────────────────────────────────────
    1.  Uncomment `import requests` at the top of this file.
    2.  Uncomment the `requests.post(...)` block below.
    3.  Remove or comment out the dry-run print statement.
    4.  Pass a real JWT token from your auth system.
         ✏️  In production, load it from an environment variable:
             os.environ["BACKEND_JWT"]

    Args:
        payload:   The dict produced by format_api_payload().
        jwt_token: Bearer token for backend authentication.
                   ✏️  Replace "DUMMY_JWT" with os.environ["BACKEND_JWT"] in
                       run_live.py before deploying.
    ─────────────────────────────────────────────────────────────────────────
    """

    # ── LIVE POST BLOCK — uncomment to activate ───────────────────────────────
    # headers = {
    #     "Content-Type":  "application/json",
    #     "Authorization": f"Bearer {jwt_token}",  # ✏️ Supply real JWT
    #     "X-Client-ID":   "fintech-ocr-pipeline-v1",
    # }
    # try:
    #     response = requests.post(
    #         OCR_ENDPOINT,
    #         json=payload,
    #         headers=headers,
    #         timeout=REQUEST_TIMEOUT_SECONDS,
    #     )
    #     response.raise_for_status()  # Raises HTTPError for 4xx / 5xx responses
    #     print(f"[Task 2 | API] Transaction posted — HTTP {response.status_code}")
    #     return response.json()
    # except requests.exceptions.Timeout:
    #     print(f"[Task 2 | API] Request timed out after {REQUEST_TIMEOUT_SECONDS}s")
    #     raise
    # except requests.exceptions.HTTPError as exc:
    #     print(f"[Task 2 | API] HTTP error: {exc.response.status_code} — {exc.response.text}")
    #     raise
    # except requests.exceptions.RequestException as exc:
    #     print(f"[Task 2 | API] Network error: {exc}")
    #     raise

    # ── DRY-RUN (active by default) ───────────────────────────────────────────
    print(
        f"[Task 2 | API] (Dry-run) Would POST to: {OCR_ENDPOINT}\n"
        f"               Merchant : {payload['merchantName']}\n"
        f"               Amount   : {payload['amount']}\n"
        f"               Category : {payload['category']}"
    )
