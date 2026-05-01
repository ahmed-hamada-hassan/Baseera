# config.py
# Central configuration and constants for the Baseera AI Chatbot Microservice.
# To switch between environments, only this file needs to be changed.

import os
from dotenv import load_dotenv

load_dotenv()

# --- Environment Mode ---
# Set to "TEST" to use mock data locally.
# Set to "LIVE" to connect to the real backend APIs.
MODE = os.getenv("MODE", "TEST")

# --- Authentication ---
# In LIVE mode, this is overridden by the per-request Bearer token from the frontend.
JWT_TOKEN = os.getenv("JWT_TOKEN", "")

# --- Backend API Endpoints ---
DASHBOARD_URL = os.getenv("DASHBOARD_URL", "http://localhost:5002/api/dashboard")
SUBSCRIPTIONS_URL = os.getenv("SUBSCRIPTIONS_URL", "http://localhost:5002/api/subscriptions")

# --- Gemini AI Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")

# --- AI System Persona ---
# This is the core identity injected into every AI request.
SYSTEM_PERSONA = (
    "You are Baseera, an expert AI financial assistant. "
    "Your goal is to analyze the user's spending and give actionable, "
    "concise advice based strictly on the provided financial context."
)
