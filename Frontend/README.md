<div align="center">

# 🖥️ Baseera — Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

A feature-rich, responsive Single-Page Application (SPA) providing an elegant financial management experience.

</div>

---

## ⚡ Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19 | UI Component Library |
| **Language** | TypeScript | 6 | Type-safe development |
| **Build Tool** | Vite | 8 | Lightning-fast dev server & bundler |
| **Styling** | Tailwind CSS | 4 | Utility-first CSS framework |
| **Routing** | React Router DOM | 7 | Client-side routing |
| **Server State** | TanStack Query (React Query) | 5 | Data fetching, caching & sync |
| **Client State** | Zustand | 5 | Global UI state (chatbot, auth) |
| **HTTP Client** | Axios | 1.x | API communication with JWT interceptors |
| **Forms** | React Hook Form + Zod | 7 + 4 | Form handling and validation |
| **Charts** | Recharts | 3 | Financial charts and visualizations |
| **Animations** | Framer Motion | 12 | Smooth page and component transitions |
| **Markdown** | react-markdown | 10 | Rendering AI chatbot responses |
| **Notifications** | Sonner | 2 | Toast notifications |
| **Icons** | Lucide React | 1.x | Modern icon set |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/Baseera.git
cd Baseera/Frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your values (see section below)

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## 🔧 Environment Variables

Create a `.env.local` file in the `Frontend/` directory:

```env
# Base URL for the ASP.NET Core backend API
VITE_API_BASE_URL=http://baseera.runasp.net/api
```

> ⚠️ **Note:** All environment variables exposed to the browser **must** be prefixed with `VITE_`.

For local backend development, change to:
```env
VITE_API_BASE_URL=http://localhost:5002/api
```

---

## 📂 Folder Structure

```
Frontend/
├── public/                     # Static assets
└── src/
    ├── app/                    # App-level configuration
    │   ├── providers/          # QueryClient, Router, Toaster wrappers
    │   └── routes/             # Route definitions and ProtectedRoute guard
    │
    ├── assets/                 # Images, logos, fonts
    │
    ├── features/               # Feature-based modules (colocation pattern)
    │   ├── auth/               # Login, Registration, Forgot Password
    │   │   ├── api/            # Auth API functions (login, register)
    │   │   ├── components/     # LoginForm, RegisterForm
    │   │   └── hooks/          # useAuth, useRegister
    │   ├── dashboard/          # Dashboard KPIs and charts
    │   ├── transactions/       # Transaction list, OCR scanner, Manual entry
    │   │   ├── api/            # getTransactions, createTransaction, submitOcr
    │   │   ├── components/     # OcrScannerModal, ManualTransactionModal
    │   │   └── hooks/          # useTransactions, useCreateTransaction, useSubmitOcr
    │   ├── chatbot/            # AI Chatbot drawer
    │   │   ├── api/            # chatbotApi.sendMessage (fetch + JWT)
    │   │   ├── components/     # ChatbotDrawer, MessageBubble (with Recharts)
    │   │   ├── hooks/          # useTypingEffect
    │   │   └── store/          # useChatStore (Zustand)
    │   ├── subscriptions/      # Subscription tracker
    │   ├── accounts/           # Bank account management
    │   └── analytics/          # Spending analytics charts
    │
    ├── pages/                  # Page-level components (assembled from features)
    │   ├── DashboardPage.tsx
    │   ├── TransactionsPage.tsx
    │   ├── LoginPage.tsx
    │   ├── SubscriptionsPage.tsx
    │   ├── AccountsPage.tsx
    │   ├── AnalyticsPage.tsx
    │   ├── ProfilePage.tsx
    │   └── PricingPage.tsx
    │
    └── shared/                 # Shared utilities, schemas, and UI primitives
        ├── lib/
        │   ├── axios.ts        # Axios instance + JWT interceptor + 401 handler
        │   └── schemas/        # Zod schemas & TypeScript types (openapi.schema.ts, chat.schema.ts)
        └── ui/                 # Reusable UI components (Card, Skeleton, etc.)
```

---

## 🏗️ Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Feature-based folder structure** | Scales well; each feature is self-contained with its own API, hooks, and components |
| **TanStack Query for server state** | Automatic caching, background refetching, and optimistic updates keep the UI always in sync |
| **Zustand for client state** | Minimal boilerplate; used exclusively for chat history and UI-only state |
| **Zod for validation** | End-to-end type safety from API schemas to form validation |
| **Axios interceptors** | Centralized JWT injection and automatic logout on 401 Unauthorized |
| **Fetch for AI chatbot** | Allows future streaming support without Axios limitations |
