# main.py
# The FastAPI Server: the public-facing entry point of the microservice.
# Handles HTTP routing, authentication, request validation, and error responses.

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import chatbot_logic
import data_fetcher

# ---------------------------------------------------------------------------
# App Initialization
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Baseera AI Chatbot Microservice",
    description="Provides AI-powered financial insights for the Baseera FinTech app.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Tighten this to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Defines the expected JSON body for the chat endpoint."""
    message: str

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
def health_check():
    """Simple liveness probe. Useful for Docker/K8s health checks."""
    return {"status": "ok", "service": "Baseera AI Chatbot"}


@app.post("/api/chatbot/message", tags=["Chatbot"])
def handle_chat_message(
    request: ChatRequest,
    authorization: str | None = Header(default=None),
):
    """
    Main chat endpoint. Accepts a user message, fetches financial context,
    and returns a structured AI response.

    - **Authorization**: Must be a valid `Bearer <token>` header.
    - **message**: The user's natural language question.
    """
    token = _extract_bearer_token(authorization)

    try:
        financial_context = data_fetcher.get_financial_context(token)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=f"Failed to retrieve financial data: {e}")

    try:
        ai_response = chatbot_logic.generate_response(
            user_message=request.message,
            financial_context=financial_context,
        )
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {e}")

    return ai_response


# ---------------------------------------------------------------------------
# Private Helpers
# ---------------------------------------------------------------------------

def _extract_bearer_token(authorization: str | None) -> str:
    """
    Validates the Authorization header and extracts the raw token string.

    Args:
        authorization: The raw value of the Authorization header.

    Returns:
        The token string (everything after "Bearer ").

    Raises:
        HTTPException 401: If the header is missing or malformed.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authorization header is missing or invalid. Expected format: 'Bearer <token>'.",
        )
    return authorization.split(" ", 1)[1]
