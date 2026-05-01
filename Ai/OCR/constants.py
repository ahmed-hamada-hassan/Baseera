# =============================================================================
# constants.py
# =============================================================================
# Central configuration file for the Receipt OCR Pipeline.
# All category lists, file paths, model names, and endpoint URLs live here.
# Import from this file in every other module — never hard-code these values.
# =============================================================================

from pathlib import Path


# -----------------------------------------------------------------------------
# GEMINI MODEL
# -----------------------------------------------------------------------------
# The Gemini model used for Vision OCR.
# gemini-1.5-flash is the recommended default: fast, cheap, and vision-capable.
# Switch to "gemini-1.5-pro" for higher accuracy on complex/blurry receipts.
# Full model list → https://ai.google.dev/gemini-api/docs/models
# -----------------------------------------------------------------------------
GEMINI_MODEL: str = "gemini-2.5-flash"


# -----------------------------------------------------------------------------
# SPENDING CATEGORIES
# -----------------------------------------------------------------------------
# These two lists define the ONLY accepted values for category classification.
# Gemini is instructed to pick strictly from these lists.
# The aggregator also uses them to initialize and validate the ledger file.
#
# ⚠️  If you add or rename a category here, you MUST also:
#     1. Clear (or manually migrate) cumulative_spending.json
#     2. Update your backend's enum/validation to match
# -----------------------------------------------------------------------------

MAIN_CATEGORIES: list[str] = [
    "Restaurants & Dining",
    "Healthcare & Medical",
    "Entertainment & Leisure",
    "Groceries & Supermarkets",
    "Transportation & Auto",
    "Utilities & Retail",
]

MICRO_CATEGORIES: list[str] = [
    "Food Items",
    "Beverages",
    "Pharmacy & Meds",
    "Services & Fees",
    "Tickets & Admissions",
    "Clothing & Apparel",
    "Household Supplies",
    "Electronics & Tech",
    "Fuel & Mileage",
]


# -----------------------------------------------------------------------------
# FILE PATHS
# -----------------------------------------------------------------------------
# SPENDING_FILE  — local JSON ledger that accumulates spending across runs.
#                  This path is relative to wherever you launch the script from.
#                  ✏️  Change this to an absolute path in production, e.g.:
#                  Path("/var/fintech/data/cumulative_spending.json")
# -----------------------------------------------------------------------------
SPENDING_FILE: Path = Path("cumulative_spending.json")


# -----------------------------------------------------------------------------
# BACKEND API
# -----------------------------------------------------------------------------
# The endpoint that receives the formatted OCR payload.
# ✏️  REPLACE with your real server URL before going live.
#
# LOCAL DEV   → "http://localhost:5002/api/transactions/ocr"
# STAGING     → "https://staging.yourapp.com/api/transactions/ocr"
# PRODUCTION  → "https://api.yourapp.com/api/transactions/ocr"
# -----------------------------------------------------------------------------
OCR_ENDPOINT: str = "http://localhost:5002/api/transactions/ocr"

# The backend endpoint that serves a receipt image given a transaction ID.
# Used exclusively by run_live.py to fetch the image before OCR.
# ✏️  REPLACE with your real image-serving endpoint.
# Expected response: raw image bytes (JPEG or PNG).
# Example URL produced: GET /api/receipts/images/<transaction_id>
# -----------------------------------------------------------------------------
RECEIPT_IMAGE_ENDPOINT: str = "http://localhost:5002/api/receipts/images"


# -----------------------------------------------------------------------------
# REQUEST CONFIG
# -----------------------------------------------------------------------------
# Timeout (seconds) for all outbound HTTP requests (image fetch + API post).
# ✏️  Increase if your backend is slow to respond on large image uploads.
# -----------------------------------------------------------------------------
REQUEST_TIMEOUT_SECONDS: int = 15
