<div align="center">

# 🔭 Baseera — بصيرة

### *Your AI-Powered Personal Finance Companion*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![.NET](https://img.shields.io/badge/.NET-8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **Baseera** is a full-stack FinTech web application that brings clarity to your personal finances through AI-driven insights, automated OCR receipt scanning, and real-time budget tracking — all in one elegant dashboard.

</div>

---

## 🚀 Demo / Live Preview

> 🌐 **Live App:** [https://baseera-kappa.vercel.app/](https://baseera-kappa.vercel.app/)

Use the following credentials to explore the full demo experience immediately — no registration required:

| Field    | Value              |
|----------|--------------------|
| 📧 Email    | `demo@baseera.com` |
| 🔑 Password | `Demo@123`         |

> **What to try:**
> 1. Check the **Dashboard** for real-time liquidity and budget indicators.
> 2. Go to **Transactions** → scan a receipt with the OCR scanner.
> 3. Add a **Manual Transaction** and watch the dashboard update instantly.
> 4. Open the **AI Chatbot** and ask: *"ما تحليلك لمصروفي هذا الشهر؟"*

---

## 📖 Project Description

Baseera (بصيرة — Arabic for *insight/clarity*) is a hackathon-born FinTech product designed to empower individuals with financial self-awareness. It bridges the gap between raw financial data and actionable intelligence using:

- 📊 **Real-time dashboards** with KPI cards, budget rings, and spending trends.
- 🤖 **Conversational AI** (Google Gemini) that analyzes your finances and responds with dynamic charts.
- 📷 **OCR Receipt Scanner** that extracts transaction data from photos automatically.
- 💳 **Subscription Tracker** to identify unused and high-risk recurring costs.
- 🏦 **Multi-Account Management** across banks and wallets.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│              React 19 + TypeScript + Vite + Tailwind             │
└──────────────────────┬───────────────────────────────────────────┘
                       │  HTTPS / REST API (Axios)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│               CORE BACKEND  (ASP.NET Core 8)                     │
│  Clean Architecture: Web → Application → Domain → Infrastructure │
│  Auth: JWT Bearer | ORM: Entity Framework Core | DB: SQL Server  │
└──────────┬───────────────────────────┬───────────────────────────┘
           │ Internal HTTP             │ Internal HTTP
           ▼                           ▼
┌─────────────────────┐   ┌────────────────────────────────────────┐
│   AI Chatbot        │   │   OCR Pipeline                         │
│   (FastAPI/Python)  │   │   (Python + Google Gemini Vision)      │
│   Port: 8000        │   │   Batch pipeline: task1→task2→task3    │
└─────────────────────┘   └────────────────────────────────────────┘
```

### Integration Flow

| Step | From | To | Method |
|------|------|----|--------|
| 1 | Frontend | Backend | `POST /api/Auth/login` → JWT Token |
| 2 | Frontend | Backend | All data APIs with `Authorization: Bearer <token>` |
| 3 | Frontend | AI Chatbot | `POST http://localhost:8000/api/chatbot/message` (local) |
| 4 | AI Chatbot | Backend | Fetches dashboard + subscriptions context using user token |
| 5 | Backend | OCR Service | Processes uploaded receipt images via Gemini Vision API |

---

## 📁 Monorepo Structure

```
Baseera/
├── 📂 Frontend/            # React + TypeScript SPA
├── 📂 Back-End/            # ASP.NET Core 8 REST API
├── 📂 Ai/
│   ├── 📂 Chatbot/         # FastAPI AI microservice
│   └── 📂 OCR/             # OCR pipeline scripts
├── 📄 requirements.txt     # Root Python dependencies
├── 📄 Baseera.Api.sln      # .NET solution file
└── 📄 README.md            # You are here
```

---

## 👥 Team

Built with ❤️ for **SalamHack 2026** hackathon.

---

## 📄 Sub-Module Documentation

| Module | README |
|--------|--------|
| 🖥️ Frontend | [Frontend/README.md](./Frontend/README.md) |
| ⚙️ Backend | [Back-End/README.md](./Back-End/README.md) |
| 🧠 AI Services | [Ai/README.md](./Ai/README.md) |
