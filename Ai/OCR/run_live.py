# =============================================================================
# run_live.py
# =============================================================================
# Live / Production Runner
# -----------------------------------------------------------------------------
# Use this file in staging and production environments.
# It fetches a receipt image directly from the backend server using a
# transaction ID, then runs the full OCR pipeline on that image.
#
# Differences vs run_dummy.py:
#   ┌─────────────────┬──────────────────────────────────┬─────────────────────────────┐
#   │                 │ run_dummy.py                      │ run_live.py (this file)     │
#   ├─────────────────┼──────────────────────────────────┼─────────────────────────────┤
#   │ Image source    │ Local file path on your device    │ Fetched from backend API    │
#   │ API key source  │ Constant or env var               │ Environment variable ONLY   │
#   │ JWT token       │ "DUMMY_JWT" placeholder            │ Real env var token          │
#   │ API post        │ Dry-run (prints only)             │ Dry-run (activate in task2) │
#   │ Use when        │ Dev, testing, local receipts      │ Production / staging server │
#   └─────────────────┴──────────────────────────────────┴─────────────────────────────┘
#
# HOW TO RUN:
#   1. Export the required environment variables (see ENVIRONMENT VARIABLES below).
#   2. Call run_live(transaction_id="<id>") from your application code, or
#      pass a transaction ID as a CLI argument:
#          python run_live.py <transaction_id>
#
# ENVIRONMENT VARIABLES REQUIRED:
#   GEMINI_API_KEY   — Your Google Gemini API key
#                      Get yours → https://aistudio.google.com/app/apikey
#   BACKEND_JWT      — Bearer token issued by your auth system for OCR service-to-service calls
#
#   Optional overrides (defaults are in constants.py):
#   RECEIPT_IMAGE_ENDPOINT — Full base URL of the image-serving endpoint
#                            Default: http://localhost:5002/api/receipts/images
#   OCR_ENDPOINT           — Full URL of the OCR transaction ingest endpoint
#                            Default: http://localhost:5002/api/transactions/ocr
# =============================================================================

import io
import os
import sys
import requests
from typing import Any

from PIL import Image

from constants import RECEIPT_IMAGE_ENDPOINT, REQUEST_TIMEOUT_SECONDS
from pipeline  import process_receipt


# =============================================================================
# IMAGE FETCHER
# =============================================================================

def fetch_receipt_image_from_backend(
    transaction_id: str,
    jwt_token: str,
) -> Image.Image:
    """
    Fetch a receipt image from the backend image-serving endpoint.

    The backend is expected to serve raw image bytes (JPEG or PNG) at:
        GET {RECEIPT_IMAGE_ENDPOINT}/{transaction_id}

    ✏  BACKEND CONTRACT — confirm these with your backend team:
        • Authentication header   : Authorization: Bearer <jwt_token>
        • Response Content-Type   : image/jpeg  OR  image/png
        • HTTP 200                : Image bytes in response body
        • HTTP 404                : Transaction ID not found
        • HTTP 401                : Invalid / expired JWT

    ✏  If your endpoint uses a different URL pattern (e.g. query params
        like ?id=<transaction_id>), update the `url` construction below.

    Args:
        transaction_id: The unique identifier of the transaction whose
                        receipt image should be fetched.
                        ✏  This is passed in by your application layer —
                            e.g. from a message queue, webhook payload, or CLI arg.
        jwt_token:      Bearer token for authenticating with the backend.
                        ✏  Load from os.environ["BACKEND_JWT"] — never hard-code.

    Returns:
        PIL Image: The receipt image ready to be passed to the OCR pipeline.

    Raises:
        requests.exceptions.HTTPError:    On non-2xx HTTP responses (404, 401, 500…).
        requests.exceptions.Timeout:      If the server does not respond in time.
        requests.exceptions.ConnectionError: If the server is unreachable.
        ValueError:                       If the response body is not a valid image.
    """
    # Build the full image URL
    # ✏  Adjust the URL pattern if your backend uses a different format:
    #     Query param  : f"{RECEIPT_IMAGE_ENDPOINT}?transactionId={transaction_id}"
    #     Path segment : f"{RECEIPT_IMAGE_ENDPOINT}/{transaction_id}/image"
    url = f"{RECEIPT_IMAGE_ENDPOINT}/{transaction_id}"

    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Accept":        "image/jpeg, image/png",  # ✏  Extend if backend serves other formats
    }

    print(f"[run_live] Fetching receipt image for transaction: '{transaction_id}'")
    print(f"[run_live] Endpoint: GET {url}")

    response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)

    # Raises HTTPError for 4xx / 5xx responses (404 not found, 401 unauthorized, etc.)
    response.raise_for_status()

    # Parse the raw image bytes into a PIL Image
    try:
        image = Image.open(io.BytesIO(response.content))
        image.load()  # Force decode — catches corrupt image files early
    except Exception as exc:
        raise ValueError(
            f"[run_live] Backend returned a response but it could not be parsed as an image.\n"
            f"Content-Type: {response.headers.get('Content-Type', 'unknown')}\n"
            f"Error: {exc}"
        ) from exc

    print(
        f"[run_live] Image fetched — "
        f"format: {image.format}, size: {image.width}x{image.height}px"
    )
    return image


# =============================================================================
# ENVIRONMENT VARIABLE LOADER
# =============================================================================

def _load_env_credentials() -> tuple[str, str]:
    """
    Load and validate required credentials from environment variables.

    Returns:
        tuple: (gemini_api_key, jwt_token)

    Raises:
        EnvironmentError: If either required variable is missing or empty.
                          This fails fast and loudly — do not run the pipeline
                          with missing credentials.
    """
    gemini_api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    jwt_token      = os.environ.get("BACKEND_JWT",    "").strip()

    missing = []
    if not gemini_api_key:
        missing.append("GEMINI_API_KEY")
    if not jwt_token:
        missing.append("BACKEND_JWT")

    if missing:
        raise EnvironmentError(
            f"[run_live] Missing required environment variable(s): {', '.join(missing)}\n\n"
            f"Set them before running:\n"
            f"  export GEMINI_API_KEY='your_gemini_key'   # Get at https://aistudio.google.com\n"
            f"  export BACKEND_JWT='your_service_jwt'     # Issued by your auth system\n"
        )

    return gemini_api_key, jwt_token


# =============================================================================
# MAIN LIVE RUNNER
# =============================================================================

def run_live(transaction_id: str) -> dict[str, Any]:
    """
    Full live pipeline for a given backend transaction ID.

    Workflow:
      1. Load credentials from environment variables.
      2. Fetch the receipt image from the backend image endpoint.
      3. Run the full OCR pipeline (Tasks 1 → 2 → 3).

    Args:
        transaction_id: The backend transaction ID whose receipt to process.
                        ✏️  In production this arrives from a message queue,
                            webhook handler, or scheduled job — pass it in here.

    Returns:
        dict: The formatted API payload produced by the pipeline.
    """
    # Step 1: Credentials
    gemini_api_key, jwt_token = _load_env_credentials()

    # Step 2: Fetch image from backend
    receipt_image = fetch_receipt_image_from_backend(transaction_id, jwt_token)

    # Step 3: Full OCR pipeline
    payload = process_receipt(
        image     = receipt_image,
        api_key   = gemini_api_key,
        jwt_token = jwt_token,
    )

    return payload


# =============================================================================
# CLI ENTRY POINT
# =============================================================================
# Allows running directly from the terminal:
#   python run_live.py <transaction_id>
#
# ✏  In production you will likely call run_live() programmatically from a
#     queue consumer, FastAPI endpoint, or cron job instead.
# =============================================================================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(
            "Usage: python run_live.py <transaction_id>\n\n"
            "Example:\n"
            "  python run_live.py txn_abc123def456\n\n"
            "Make sure the following env vars are set:\n"
            "  GEMINI_API_KEY — your Google Gemini API key\n"
            "  BACKEND_JWT    — service-to-service JWT from your auth system"
        )
        sys.exit(1)

    transaction_id_arg = sys.argv[1]

    print(f"[run_live] Starting live pipeline for transaction: '{transaction_id_arg}'")
    run_live(transaction_id=transaction_id_arg)
