# =============================================================================
# task3_aggregator.py
# =============================================================================
# Task 3 — Cumulative Spending Aggregator
# -----------------------------------------------------------------------------
# Responsibilities:
#   • Load (or auto-initialize) the cumulative_spending.json ledger
#   • Add the current bill's total to the correct Main Category
#   • Add each micro-category subtotal to the correct Micro Category
#   • Persist the updated ledger back to disk
#
# JSON ledger structure:
# {
#   "Main_Categories": {
#     "Restaurants & Dining":      0.0,
#     "Healthcare & Medical":      0.0,
#     ... (all 6 main categories)
#   },
#   "Micro_Categories": {
#     "Food Items":                0.0,
#     "Beverages":                 0.0,
#     ... (all 9 micro categories)
#   }
# }
# =============================================================================

import json
from typing import Any

from constants import MAIN_CATEGORIES, MICRO_CATEGORIES, SPENDING_FILE


# -----------------------------------------------------------------------------
# INTERNAL HELPERS
# -----------------------------------------------------------------------------

def _initialize_spending_structure() -> dict[str, dict[str, float]]:
    """
    Build a brand-new ledger with every category set to 0.0.

    Called when the ledger file does not exist yet, or when it is found to
    be corrupted/incomplete.  Using constants ensures the structure here
    is always in sync with the category lists defined in constants.py.

    Returns:
        dict: Clean ledger with two top-level keys and all values at 0.0.
    """
    return {
        "Main_Categories":  {cat: 0.0 for cat in MAIN_CATEGORIES},
        "Micro_Categories": {cat: 0.0 for cat in MICRO_CATEGORIES},
    }


def _load_spending_file() -> dict[str, Any]:
    """
    Read and return the ledger from disk.

    Handles three failure scenarios gracefully so the pipeline never crashes
    due to a missing or malformed file:
      1. File does not exist      → returns fresh initialized structure
      2. JSON is malformed        → returns fresh initialized structure
      3. Top-level keys missing   → returns fresh initialized structure

    Also back-fills any new categories that were added to constants.py after
    the file was first created — enabling safe schema migrations.

    Returns:
        dict: The current ledger, guaranteed to have both top-level keys
              and entries for every defined category.
    """
    if not SPENDING_FILE.exists():
        print(f"[Task 3 | Aggregator] '{SPENDING_FILE}' not found — initializing fresh ledger.")
        return _initialize_spending_structure()

    try:
        with SPENDING_FILE.open("r", encoding="utf-8") as fh:
            data: dict[str, Any] = json.load(fh)

    except (json.JSONDecodeError, OSError) as exc:
        print(f"[Task 3 | Aggregator] Could not read ledger ({exc}) — re-initializing.")
        return _initialize_spending_structure()

    # Ensure both top-level keys are present (guards against partial writes)
    if "Main_Categories" not in data or "Micro_Categories" not in data:
        print("[Task 3 | Aggregator] Ledger structure incomplete — re-initializing.")
        return _initialize_spending_structure()

    # Back-fill any new categories added to constants.py since last save.
    # Existing categories retain their accumulated values.
    for cat in MAIN_CATEGORIES:
        data["Main_Categories"].setdefault(cat, 0.0)
    for cat in MICRO_CATEGORIES:
        data["Micro_Categories"].setdefault(cat, 0.0)

    return data


def _save_spending_file(data: dict[str, Any]) -> None:
    """
    Persist the updated ledger to disk as pretty-printed JSON.

    Args:
        data: The fully updated ledger dict to write.

    Raises:
        OSError: If the file cannot be written (e.g. permission denied).
                 ✏️  In production, wrap the caller in a try/except and
                     send an alert if this fails — the ledger is critical data.
    """
    with SPENDING_FILE.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)

    print(f"[Task 3 | Aggregator] Ledger saved → '{SPENDING_FILE}'")


# -----------------------------------------------------------------------------
# PUBLIC ENTRY POINT
# -----------------------------------------------------------------------------

def update_aggregated_totals(
    main_category: str,
    total_amount: float,
    micro_category_totals_dict: dict[str, float],
) -> None:
    """
    Update the cumulative spending ledger with data from the latest receipt.

    Execution flow:
      1. Validate all input values against the whitelisted category constants.
      2. Load the current ledger (or initialize if absent/corrupt).
      3. Add total_amount to the matching Main Category bucket.
      4. Loop through micro_category_totals_dict and add each subtotal to its
         matching Micro Category bucket.
      5. Save the updated ledger back to disk.

    All arithmetic is rounded to 2 decimal places at each step to prevent
    floating-point drift accumulating across many transactions.

    Args:
        main_category:              The overall category for this receipt.
                                    Must be one of MAIN_CATEGORIES.
        total_amount:               The receipt's grand total as a float.
        micro_category_totals_dict: Mapping of micro-category → subtotal for
                                    this bill only (from task2_payload).
                                    e.g. {"Food Items": 30.50, "Beverages": 11.75}

    Raises:
        ValueError: If main_category or any key in micro_category_totals_dict
                    is not in the allowed constants lists.
                    Validation happens BEFORE any file I/O so the ledger is
                    never modified with invalid data.
    """
    # ── Input validation (before touching the file) ───────────────────────────
    if main_category not in MAIN_CATEGORIES:
        raise ValueError(
            f"[Task 3 | Aggregator] Unknown main category: '{main_category}'.\n"
            f"Allowed values: {MAIN_CATEGORIES}"
        )

    unknown_micro_cats = set(micro_category_totals_dict.keys()) - set(MICRO_CATEGORIES)
    if unknown_micro_cats:
        raise ValueError(
            f"[Task 3 | Aggregator] Unknown micro categories: {unknown_micro_cats}.\n"
            f"Allowed values: {MICRO_CATEGORIES}"
        )

    # ── Load current ledger ───────────────────────────────────────────────────
    ledger = _load_spending_file()

    # ── Update Main Category ──────────────────────────────────────────────────
    previous_main = ledger["Main_Categories"][main_category]
    updated_main  = round(previous_main + float(total_amount), 2)

    ledger["Main_Categories"][main_category] = updated_main

    print(
        f"[Task 3 | Aggregator] Main  '{main_category}': "
        f"{previous_main:.2f} + {total_amount:.2f} = {updated_main:.2f}"
    )

    # ── Update Micro Categories ───────────────────────────────────────────────
    for micro_cat, subtotal in micro_category_totals_dict.items():
        previous_micro = ledger["Micro_Categories"][micro_cat]
        updated_micro  = round(previous_micro + float(subtotal), 2)

        ledger["Micro_Categories"][micro_cat] = updated_micro

        print(
            f"[Task 3 | Aggregator] Micro '{micro_cat}': "
            f"{previous_micro:.2f} + {subtotal:.2f} = {updated_micro:.2f}"
        )

    # ── Persist ───────────────────────────────────────────────────────────────
    _save_spending_file(ledger)
