# data_fetcher.py
# The API Bridge: responsible for retrieving financial context data.
# Abstracts the data source — the rest of the app doesn't care if it's
# mock data or a live API call.

import requests

import config
import mock_data


def get_financial_context(token: str) -> dict:
    """
    Fetches the user's full financial context.

    In TEST mode, returns local mock data instantly.
    In LIVE mode, calls the real backend APIs using the user's Bearer token.

    Args:
        token: The JWT Bearer token extracted from the Authorization header.

    Returns:
        A dictionary containing the combined financial data.

    Raises:
        RuntimeError: If a live API call fails or returns a non-200 status.
    """
    if config.MODE == "TEST":
        return _get_mock_context()

    if config.MODE == "LIVE":
        return _get_live_context(token)

    raise ValueError(f"Invalid MODE '{config.MODE}' in config.py. Must be 'TEST' or 'LIVE'.")


# --- Private helpers ---

def _get_mock_context() -> dict:
    """Returns the static mock dataset for local development."""
    return mock_data.MOCK_DASHBOARD_DATA


def _get_live_context(token: str) -> dict:
    """
    Performs authenticated GET requests to the live backend services
    and merges the results into a single context dictionary.
    """
    headers = {"Authorization": f"Bearer {token}"}

    dashboard_data = _fetch_endpoint(config.DASHBOARD_URL, headers, "Dashboard")
    subscriptions_data = _fetch_endpoint(config.SUBSCRIPTIONS_URL, headers, "Subscriptions")

    # Merge both API responses into one unified context dict for the AI
    return {**dashboard_data, **subscriptions_data}


def _fetch_endpoint(url: str, headers: dict, service_name: str) -> dict:
    """
    A generic, reusable helper to GET a single JSON endpoint.

    Args:
        url:          The full endpoint URL.
        headers:      Request headers (includes the auth token).
        service_name: A human-readable label used in error messages.

    Returns:
        The parsed JSON response as a dictionary.

    Raises:
        RuntimeError: On network error or non-200 HTTP response.
    """
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        raise RuntimeError(
            f"{service_name} API returned an error: {e.response.status_code} - {e.response.text}"
        ) from e
    except requests.exceptions.ConnectionError as e:
        raise RuntimeError(
            f"Could not connect to the {service_name} API at '{url}'. Is the backend running?"
        ) from e
    except requests.exceptions.Timeout:
        raise RuntimeError(
            f"Request to the {service_name} API timed out after 10 seconds."
        )
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"An unexpected error occurred calling {service_name} API: {e}") from e
