# =============================================================================
# run_dummy.py
# =============================================================================
# Development Runner — tests the REAL Gemini API with an image from your device.
#
# ─── SETUP: ONLY TWO LINES YOU NEED TO CHANGE ────────────────────────────────
#
#   1. Set IMAGE_PATH    → the path to a receipt photo on your computer
#   2. Set GEMINI_API_KEY → your key from https://aistudio.google.com/app/apikey
#
#   Both are in the "YOUR INPUTS" section directly below.
#
# ─── THEN RUN ─────────────────────────────────────────────────────────────────
#
#   python run_dummy.py
#
# =============================================================================

import json
from pathlib import Path
import easygui
from PIL import Image
import os
from pipeline import process_receipt
from constants import SPENDING_FILE
from dotenv import load_dotenv



load_dotenv()
# =============================================================================
# >>> YOUR INPUTS — FILL THESE IN BEFORE RUNNING <<<
# =============================================================================

# --- INPUT 1: Your receipt image ---
#
# Paste the full path to your receipt photo between the quotes below.
#
# How to get the path:
#   Windows → Right-click the file → "Copy as path"
#             Example: r"C:\Users\Mohamed\Pictures\receipt.jpg"
#             (keep the  r  before the quote — it handles backslashes)
#
#   macOS   → Right-click the file → hold Option → "Copy as Pathname"
#             Example: "/Users/mohamed/Desktop/receipt.jpg"
#
#   Linux   → Right-click the file → "Copy Path"
#             Example: "/home/mohamed/receipts/receipt.png"
#
IMAGE_PATH: str = easygui.fileopenbox(title="Select Receipt")   # ← Paste your path here, e.g.  "/Users/you/Desktop/receipt.jpg"


# --- INPUT 2: Your Gemini API key ---
#
# 1. Go to  https://aistudio.google.com/app/apikey
# 2. Click "Create API Key"
# 3. Copy the key (starts with "AIza...")
# 4. Paste it between the quotes below
#
# ⚠️  IMPORTANT: Never share this file or commit it to Git with the key inside.
#     When you move to production, use run_live.py instead (uses environment variables).
#

GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")  # ← Paste your key here, e.g.  "AIzaSyB..."


# =============================================================================
# RUNNER  (no need to edit anything below this line)
# =============================================================================

def run_dummy() -> None:
    """
    Validate inputs, load the receipt image from disk, and run the full
    OCR pipeline (Tasks 1 → 2 → 3) against the real Gemini API.
    """

    # ── Step 0: Make sure both inputs have been filled in ────────────────────
    _check_inputs()

    # ── Step 1: Load the image from your device ───────────────────────────────
    image_path = Path(IMAGE_PATH)

    if not image_path.exists():
        raise FileNotFoundError(
            f"\n[run_dummy] Cannot find the image at:\n"
            f"  {image_path}\n\n"
            f"Double-check that the path in IMAGE_PATH is correct and the file exists."
        )

    print(f"[run_dummy] Loading image: {image_path.resolve()}")
    receipt_image = Image.open(image_path)
    print(f"[run_dummy] Image loaded — format: {receipt_image.format}, size: {receipt_image.size}")

    # ── Step 2–4: Run the full pipeline (OCR → Payload → Aggregator) ─────────
    payload = process_receipt(
        image     = receipt_image,
        api_key   = GEMINI_API_KEY,
        jwt_token = "DUMMY_JWT",    # Backend post is dry-run in dev — safe to leave as-is
    )

    # ── Step 5: Print a final summary ─────────────────────────────────────────
    _print_final_summary(payload)


# =============================================================================
# HELPERS
# =============================================================================

def _check_inputs() -> None:
    """
    Catch empty inputs before anything runs and print a clear, actionable message.
    Much friendlier than getting a cryptic API auth error three steps later.
    """
    errors = []

    if not IMAGE_PATH.strip():
        errors.append(
            "  IMAGE_PATH is empty.\n"
            "  → Open run_dummy.py and paste your receipt image path between the quotes:\n"
            '     IMAGE_PATH: str = "/Users/you/Desktop/receipt.jpg"'
        )

    if not GEMINI_API_KEY.strip():
        errors.append(
            "  GEMINI_API_KEY is empty.\n"
            "  → Get your key at https://aistudio.google.com/app/apikey\n"
            "  → Then paste it between the quotes:\n"
            '     GEMINI_API_KEY: str = "AIzaSyB..."'
        )

    if errors:
        divider = "─" * 62
        print(f"\n{divider}")
        print("  [run_dummy] Setup incomplete — please fix the following:")
        print(divider)
        for error in errors:
            print(f"\n{error}")
        print(f"\n{divider}\n")
        raise SystemExit(1)   # Exit cleanly — no stack trace


def _print_final_summary(payload: dict) -> None:
    """Print the final API payload and the updated cumulative ledger."""

    print("\n── Final API Payload ─────────────────────────────────────────")
    print(json.dumps(payload, indent=2, ensure_ascii=False))

    if SPENDING_FILE.exists():
        print(f"\n── Cumulative Ledger ({SPENDING_FILE}) ───────────────────────")
        with SPENDING_FILE.open("r", encoding="utf-8") as fh:
            print(json.dumps(json.load(fh), indent=2, ensure_ascii=False))

    print("\n[run_dummy] ✓ Done.\n")


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    run_dummy()
