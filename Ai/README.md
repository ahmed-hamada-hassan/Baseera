<div align="center">

# 🧠 Baseera — AI Services

[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI-499848?style=for-the-badge)](https://www.uvicorn.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-2-E92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)

Two independent AI-powered Python services providing intelligent financial analysis and automated receipt data extraction.

</div>

---

## 🗂️ Services Overview

```
Ai/
├── 📂 Chatbot/     # FastAPI microservice — conversational AI financial advisor
└── 📂 OCR/         # Pipeline scripts — receipt scanning & data extraction
```

---

## 🤖 Service 1: AI Chatbot Microservice

### What it does

A FastAPI server that acts as an intelligent financial advisor. It:
1. **Receives** a user's natural language question (e.g., *"ما تحليلك لمصروفي هذا الشهر؟"*).
2. **Fetches** the user's financial context (dashboard + subscriptions) from the backend using their JWT.
3. **Constructs** a structured prompt and sends it to **Google Gemini 2.5 Flash**.
4. **Returns** a structured JSON response with a `textReply` (advice) and `chartData` (for visualization).

### Models Used

| Model | Provider | Purpose |
|-------|----------|---------|
| `gemini-2.5-flash` | Google AI | Natural language understanding + financial reasoning + structured JSON output |

### Architecture

```
Frontend Request
      │
      ▼
  main.py (FastAPI Router)
      │  extracts Bearer token
      ▼
  data_fetcher.py
      │  fetches dashboard + subscriptions from backend
      ▼
  chatbot_logic.py
      │  builds system prompt + calls Gemini API
      ▼
  Gemini 2.5 Flash
      │  returns JSON {textReply, chartData}
      ▼
  Frontend (renders text + Recharts bar chart)
```

### 📁 File Structure

```
Chatbot/
├── main.py             # FastAPI app, routes, CORS, Bearer token extraction
├── chatbot_logic.py    # Gemini API interaction, prompt engineering, JSON parsing
├── data_fetcher.py     # Fetches live/mock financial context from backend
├── config.py           # Centralized config (env vars, mode, URLs, persona)
├── mock_data.py        # Static mock data for TEST mode (no backend needed)
└── test_api.py         # Quick test script to validate the API
```

---

## 🔍 Service 2: OCR Receipt Processing Pipeline

### What it does

A multi-stage batch pipeline that processes receipt images using Google Gemini Vision API to extract structured transaction data.

### Pipeline Stages

```
receipt_image.jpg
      │
      ▼
  task1_ocr.py          → Extracts raw text from receipt via Gemini Vision
      │
      ▼
  task2_payload.py      → Normalizes text into structured transaction JSON
      │
      ▼
  task3_aggregator.py   → Aggregates data, deduplicates, formats final output
      │
      ▼
  Structured Transaction Object → POSTed to /api/Transactions
```

### Models Used

| Model | Provider | Purpose |
|-------|----------|---------|
| `gemini-2.5-flash` | Google AI | Vision OCR — text extraction from receipt images |
| `gemini-2.5-flash` | Google AI | Structured data normalization from raw text |

---

## 🚀 Setup & Running

### Prerequisites

- **Python 3.14+**
- **pip**
- A valid **Google Gemini API Key** — [Get one here](https://aistudio.google.com/app/apikey)

---

### 🤖 Running the Chatbot Service

```bash
# 1. Navigate to the Chatbot directory
cd Ai/Chatbot

# 2. Install dependencies
pip install -r ../../requirements.txt

# 3. Create your .env file
cp .env.example .env
# Edit .env with your Gemini API key (see Environment Variables below)

# 4. Start the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at **http://localhost:8000**

**Swagger UI:** http://localhost:8000/docs

**Health Check:** `GET http://localhost:8000/health`

---

### 📷 Running the OCR Pipeline

```bash
# 1. Navigate to the OCR directory
cd Ai/OCR

# 2. Install OCR-specific dependencies
pip install -r requirements.txt

# 3. Run the full pipeline with a sample image
python run_live.py

# Or run the dummy/test pipeline
python run_dummy1.1.py
```

---

## 🔧 Environment Variables

### Chatbot Service (`Ai/Chatbot/.env`)

```env
# REQUIRED: Your Google Gemini API key
GEMINI_API_KEY=AIzaSy...your_key_here

# Operation mode: TEST (uses mock data) | LIVE (calls real backend)
MODE=LIVE

# Gemini model to use
GEMINI_MODEL_NAME=gemini-2.5-flash

# Backend API URLs (used in LIVE mode)
DASHBOARD_URL=http://baseera.runasp.net/api/Dashboard
SUBSCRIPTIONS_URL=http://baseera.runasp.net/api/Subscriptions
```

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `GEMINI_API_KEY` | — | ✅ Yes | Google AI Studio API key |
| `MODE` | `TEST` | ✅ Yes | `TEST` for local mock data, `LIVE` for real backend |
| `GEMINI_MODEL_NAME` | `gemini-2.5-flash` | ❌ Optional | Gemini model version |
| `DASHBOARD_URL` | `localhost:5002/api/dashboard` | Only in LIVE | Backend dashboard endpoint |
| `SUBSCRIPTIONS_URL` | `localhost:5002/api/subscriptions` | Only in LIVE | Backend subscriptions endpoint |

> 💡 **Tip:** Use `MODE=TEST` during development — the chatbot will use realistic mock financial data without needing the backend to be running.

---

## 📡 Chatbot API Reference

### `POST /api/chatbot/message`

Send a user message and receive an AI financial analysis response.

**Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "ما تحليلك لمصروفي هذا الشهر؟"
}
```

**Response:**
```json
{
  "textReply": "هذا الشهر، أنفقت 63% من دخلك. أنصح بمراجعة الاشتراكات غير المستخدمة...",
  "chartData": {
    "labels": ["Housing", "Food", "Shopping", "Subscriptions"],
    "values": [3500, 1200, 1400, 620]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `textReply` | `string` | Natural language financial advice in Arabic |
| `chartData.labels` | `string[]` | Spending category names |
| `chartData.values` | `number[]` | Corresponding amounts in EGP |

---

## 📦 Python Dependencies

### Root `requirements.txt` (Chatbot)

```
fastapi==0.136.1
google-genai==1.74.0
pydantic==2.13.3
python-dotenv==1.2.2
requests==2.33.1
uvicorn==0.46.0
```

### OCR-specific (`Ai/OCR/requirements.txt`)

See [`Ai/OCR/requirements.txt`](./OCR/requirements.txt) for the full list of OCR pipeline dependencies.
