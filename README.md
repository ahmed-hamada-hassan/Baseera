# 🏦 Baseera API

**FinTech Hackathon MVP** — Personal Finance Management with AI-Driven Subscription Detection

Built with **.NET 8**, **SQL Server**, **ASP.NET Core Identity**, and **JWT Authentication**.

---

## Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
  - [Auth](#1-auth)
  - [Accounts](#2-accounts)
  - [Transactions](#3-transactions)
  - [Subscriptions](#4-subscriptions)
  - [Dashboard](#5-dashboard)
- [Business Logic](#business-logic)
  - [Subscription Detection (Implicit Linking)](#subscription-detection-implicit-linking)
  - [At-Risk Detection](#at-risk-detection)
  - [OCR Processing](#ocr-processing)
- [Data Models](#data-models)
- [Rate Limiting](#rate-limiting)
- [Seed Data](#seed-data)
- [Configuration](#configuration)

---

## Architecture

The project follows a **simplified Clean Architecture** within a single project:

```
Baseera.Api/
│
├── Domain/                          # Core business entities & enums
│   ├── Entities/
│   │   ├── Account.cs               # Bank/wallet account
│   │   ├── Transaction.cs           # Financial transaction
│   │   └── Subscription.cs          # Tracked subscription
│   └── Enums/
│       ├── TransactionSource.cs     # Bank | OCR | Manual
│       ├── TransactionStatus.cs     # Pending | Confirmed | Flagged
│       └── SubscriptionStatus.cs    # Active | AtRisk | Cancelled
│
├── Application/                     # Business logic & contracts
│   ├── DTOs/
│   │   └── DTOs.cs                  # All request/response DTOs
│   ├── Interfaces/                  # Repository & service contracts
│   └── Services/
│       ├── BankSyncService.cs       # Mock Open Banking sync
│       ├── SubscriptionEngine.cs    # Implicit linking detection
│       ├── FinancialInsightsService.cs  # At-risk evaluation
│       └── OCRService.cs            # Bill scanning processor
│
├── Infrastructure/                  # Data access & identity
│   ├── Data/
│   │   ├── AppDbContext.cs          # EF Core DbContext
│   │   └── SeedData.cs             # Demo data seeder
│   ├── Identity/
│   │   └── ApplicationUser.cs      # Extended IdentityUser
│   ├── Migrations/                  # EF Core migrations
│   └── Repositories/               # EF Core implementations
│
├── Web/                             # API surface
│   ├── Controllers/                 # 5 API controllers
│   ├── Middleware/
│   │   └── GlobalExceptionMiddleware.cs
│   └── Configurations/
│       └── RateLimitingConfig.cs
│
├── MockData/
│   └── mock_transactions.json       # Simulated bank data
│
├── Program.cs                       # Application entry point & DI
└── appsettings.json                 # Configuration
```

### Dependency Flow

```
Controllers → Services/Interfaces → Repositories → DbContext → SQL Server
                                         ↑
                                    Domain Entities
```

---

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server (LocalDB is included with Visual Studio)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Baseera

# 2. Restore packages
dotnet restore

# 3. Apply database migrations
dotnet ef database update

# 4. Run the API
dotnet run
```

The API will start at `http://localhost:5002` (or the URL in `launchSettings.json`).

Swagger UI is available at the root URL: **http://localhost:5002/swagger**

### Demo Credentials

| Email | Password | Monthly Income |
|-------|----------|---------------|
| `demo@baseera.com` | `Demo@123` | 25,000 EGP |

---

## Authentication Flow

The API uses **JWT Bearer Token** authentication with **24-hour expiration**.

```
┌─────────┐       POST /api/auth/login        ┌─────────────┐
│  Client  │ ──────────────────────────────► │  AuthController │
│          │   { email, password }            │               │
│          │ ◄────────────────────────────── │               │
│          │   { token, expiration, ... }     └───────────────┘
│          │
│          │       GET /api/accounts           ┌─────────────────┐
│          │ ──────────────────────────────► │ AccountsController │
│          │   Authorization: Bearer <token>  │                   │
│          │ ◄────────────────────────────── │                   │
│          │   [ { id, provider, balance } ]  └───────────────────┘
└──────────┘
```

### Step-by-Step

1. **Register** or **Login** → receive a JWT token
2. Include the token in all subsequent requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```
3. The token contains these claims:
   - `sub` — User ID (GUID)
   - `email` — User email
   - `firstName` / `lastName` — User name
   - `exp` — Expiration timestamp (24h from issue)

### JWT Configuration

| Setting | Value |
|---------|-------|
| Algorithm | HMAC-SHA256 |
| Expiration | 24 hours |
| Issuer | `Baseera.Api` |
| Audience | `Baseera.Client` |

---

## API Endpoints

### 1. Auth

> **Rate Limit**: `IpRateLimit` — 5 requests/minute per IP

#### `POST /api/auth/register`

Creates a new user account (serves as onboarding).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123",
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "monthlyIncome": 25000.00
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiration": "2026-04-30T00:09:58Z",
  "userId": "559b1975-535c-473e-973e-b2242ada747e",
  "email": "user@example.com",
  "fullName": "Ahmed Hassan"
}
```

**Error Responses:**
- `400` — Validation errors (weak password, missing fields)
- `409` — Email already registered

**Password Requirements:**
- Minimum 6 characters
- At least 1 uppercase, 1 lowercase, 1 digit, 1 special character

---

#### `POST /api/auth/login`

Authenticates an existing user.

**Request Body:**
```json
{
  "email": "demo@baseera.com",
  "password": "Demo@123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiration": "2026-04-30T00:09:58Z",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "demo@baseera.com",
  "fullName": "Ahmed Hassan"
}
```

**Error Responses:**
- `401` — Invalid email or password

---

### 2. Accounts

> 🔒 **Requires Authentication** | **Rate Limit**: `UserRateLimit` — 40 requests/minute per user

#### `GET /api/accounts`

Returns all financial accounts for the authenticated user.

**Response (200):**
```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "providerName": "CIB",
    "balance": 18500.75
  },
  {
    "id": "22222222-2222-2222-2222-222222222222",
    "providerName": "Vodafone Cash",
    "balance": 3200.00
  }
]
```

---

#### `POST /api/accounts/sync`

Syncs transactions from the mocked Open Banking API. **Also triggers subscription detection** after sync.

**Request Body:**
```json
{
  "accountId": "11111111-1111-1111-1111-111111111111"
}
```

**Response (200):**
```json
{
  "message": "Synced 10 transactions. Detected 4 new subscriptions.",
  "transactionsSynced": 10,
  "subscriptionsDetected": 4
}
```

**Error Responses:**
- `404` — Account not found or doesn't belong to user

**What happens internally:**
1. Reads transactions from `MockData/mock_transactions.json`
2. Saves them to the database linked to the specified account
3. Runs the **Subscription Engine** to detect recurring payments
4. Returns count of synced transactions and newly detected subscriptions

---

### 3. Transactions

> 🔒 **Requires Authentication** | **Rate Limit**: `UserRateLimit` — 40 requests/minute per user

#### `GET /api/transactions`

Returns paginated transaction history (newest first).

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `pageSize` | int | 50 | Items per page |

**Example:** `GET /api/transactions?page=1&pageSize=10`

**Response (200):**
```json
[
  {
    "id": "7bad7b31-e7a5-4d37-b124-7defef4cd6cb",
    "accountId": null,
    "amount": 175.50,
    "merchantName": "Pizza Hut",
    "category": "Food",
    "source": "OCR",
    "status": "Pending",
    "isSubscription": false,
    "transactionDate": "2026-04-28T18:00:00Z"
  }
]
```

---

#### `POST /api/transactions/ocr`

Submits AI-processed bill data. Creates a **Pending** transaction (no account linked).

**Request Body:**
```json
{
  "amount": 175.50,
  "merchantName": "Pizza Hut",
  "category": "Food",
  "transactionDate": "2026-04-28T18:00:00Z",
  "rawAiData": "{\"confidence\": 0.95, \"items\": [\"pizza\", \"drinks\"]}"
}
```

**Response (201):**
```json
{
  "id": "7bad7b31-e7a5-4d37-b124-7defef4cd6cb",
  "accountId": null,
  "amount": 175.50,
  "merchantName": "Pizza Hut",
  "category": "Food",
  "source": "OCR",
  "status": "Pending",
  "isSubscription": false,
  "transactionDate": "2026-04-28T18:00:00Z"
}
```

**Notes:**
- `accountId` is always `null` for OCR transactions
- `source` is automatically set to `"OCR"`
- `status` is automatically set to `"Pending"` — must be confirmed manually via PATCH

---

#### `POST /api/transactions/manual`

Creates a manual transaction. Creates a **Confirmed** transaction.

**Request Body:**
```json
{
  "amount": 50.00,
  "title": "Coffee",
  "category": "Food & Drink",
  "transactionDate": "2026-04-30T10:00:00Z"
}
```

**Response (201):**
```json
{
  "id": "8c9b5a32-1e4b-4a5c-8d12-9b2f4c5e6a7b",
  "accountId": null,
  "amount": 50.00,
  "merchantName": "Coffee",
  "category": "Food & Drink",
  "source": "Manual",
  "status": "Confirmed",
  "isSubscription": false,
  "transactionDate": "2026-04-30T10:00:00Z"
}
```

**Notes:**
- `source` is automatically set to `"Manual"`
- `status` is automatically set to `"Confirmed"`
- `merchantName` in the response maps to the requested `title`

---

#### `PATCH /api/transactions/{id}/status`

Updates a transaction's status (e.g., confirm or flag an OCR transaction).

**Path Parameter:** `id` — Transaction GUID

**Request Body:**
```json
{
  "status": "Confirmed"
}
```

**Valid status values:** `Pending`, `Confirmed`, `Flagged`

**Response (200):** Returns the updated transaction object.

**Error Responses:**
- `400` — Invalid status value
- `403` — Transaction belongs to another user
- `404` — Transaction not found

---

### 4. Subscriptions

> 🔒 **Requires Authentication** | **Rate Limit**: `UserRateLimit` — 40 requests/minute per user

#### `GET /api/subscriptions`

Returns all subscriptions. **Automatically evaluates at-risk status** before returning results.

**Response (200):**
```json
[
  {
    "id": "13da9a96-5e7e-422a-af3b-121c683b3928",
    "serviceName": "Netflix",
    "monthlyCost": 199.99,
    "lastPaymentDate": "2026-04-27T22:26:41Z",
    "lastActivityDate": "2026-04-27T22:26:41Z",
    "usageScore": 85.00,
    "status": "Active"
  },
  {
    "id": "05ff5866-574f-49e2-824d-3e156b19ab4d",
    "serviceName": "Gold's Gym",
    "monthlyCost": 500.00,
    "lastPaymentDate": "2026-04-25T22:26:41Z",
    "lastActivityDate": "2026-03-14T22:26:41Z",
    "usageScore": 12.00,
    "status": "AtRisk"
  }
]
```

**Status values:**
| Status | Meaning |
|--------|---------|
| `Active` | Subscription is healthy |
| `AtRisk` | Low usage or inactive — user should review |
| `Cancelled` | User cancelled the subscription |

---

#### `PATCH /api/subscriptions/{id}/cancel`

Cancels a subscription (sets status to `Cancelled`).

**Path Parameter:** `id` — Subscription GUID

**Response (200):** Returns the updated subscription with `status: "Cancelled"`.

**Error Responses:**
- `400` — Already cancelled
- `403` — Subscription belongs to another user
- `404` — Subscription not found

---

### 5. Dashboard

> 🔒 **Requires Authentication** | **Rate Limit**: `UserRateLimit` — 40 requests/minute per user

#### `GET /api/dashboard`

Returns a comprehensive **Financial Health Overview** for the current month.

**Response (200):**
```json
{
  "monthlyIncome": 25000.00,
  "totalSpendThisMonth": 8970.46,
  "remainingBudget": 16029.54,
  "totalSubscriptionCost": 1139.96,
  "activeSubscriptions": 5,
  "atRiskSubscriptions": 2,
  "atRiskSubscriptionsList": [
    {
      "id": "05ff5866-...",
      "serviceName": "Gold's Gym",
      "monthlyCost": 500.00,
      "usageScore": 12.00,
      "status": "AtRisk"
    }
  ],
  "spendByCategory": [
    { "category": "Shopping", "amount": 3950.00 },
    { "category": "Utilities", "amount": 1800.00 },
    { "category": "Groceries", "amount": 1250.00 }
  ]
}
```

**What's calculated:**
- `totalSpendThisMonth` — Sum of all transactions from the 1st of the current month
- `remainingBudget` — `monthlyIncome - totalSpendThisMonth`
- `totalSubscriptionCost` — Sum of all non-cancelled subscription costs
- `spendByCategory` — Aggregated spending grouped by category, sorted descending

---

## Business Logic

### Subscription Detection (Implicit Linking)

The **SubscriptionEngine** scans transactions to find recurring payment patterns.

```
Transactions → Normalize Merchant Names → Group by Name → ≥2 in 90 days? → Subscription!
```

**How it works:**

1. **Normalize merchant names** — lowercase, strip `.com/.eg`, remove punctuation
   ```
   "NETFLIX.COM"      → "netflix"
   "Netflix Inc"      → "netflix"
   "SPOTIFY AB"       → "spotify"
   "Gold's Gym"       → "golds gym"
   "GOLDS GYM CAIRO"  → "golds gym"
   ```

2. **Match against known services** — a built-in dictionary maps normalized names to canonical service names:
   ```
   "netflix"  → "Netflix"
   "spotify"  → "Spotify"
   "gold"     → "Gold's Gym"
   "adobe"    → "Adobe Creative Cloud"
   "linkedin" → "LinkedIn Premium"
   ```

3. **Group and detect** — if a normalized merchant appears **≥2 times in the last 90 days**, it's flagged as a subscription

4. **Create/update records** — creates `Subscription` entries and marks matching `Transaction.IsSubscription = true`

**Trigger:** Subscription detection runs automatically after every bank sync (`POST /api/accounts/sync`).

---

### At-Risk Detection

The **FinancialInsightsService** evaluates subscriptions and flags those that may be unused.

**A subscription is flagged as `AtRisk` if either:**

| Rule | Condition |
|------|-----------|
| Low usage | `UsageScore < 20` |
| Inactive | `CurrentDate - LastActivityDate > 30 days` |

**Trigger:** At-risk evaluation runs automatically when:
- `GET /api/subscriptions` is called
- `GET /api/dashboard` is called

---

### OCR Processing

The **OCRService** receives AI-extracted bill data from a mobile app's camera/OCR feature.

**Flow:**
```
Mobile App → Camera → AI/OCR → Extract {amount, merchant, date} → POST /api/transactions/ocr
                                                                         ↓
                                                                  Saved as "Pending"
                                                                         ↓
                                                              User reviews & confirms
                                                                         ↓
                                                            PATCH /api/transactions/{id}/status
                                                              { "status": "Confirmed" }
```

---

## Data Models

### ApplicationUser (extends IdentityUser)

| Field | Type | Description |
|-------|------|-------------|
| Id | string (GUID) | Identity primary key |
| FirstName | string(100) | User's first name |
| LastName | string(100) | User's last name |
| MonthlyIncome | decimal(18,2) | Declared income for budget |
| Email | string | Login email |

### Account

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary key |
| UserId | Guid | Owner reference |
| ProviderName | string(150) | e.g., "CIB", "Vodafone Cash" |
| Balance | decimal(18,2) | Current balance |

### Transaction

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary key |
| UserId | Guid | Owner reference |
| AccountId | Guid? | Nullable — null for OCR/cash |
| Amount | decimal(18,2) | Transaction amount |
| MerchantName | string(250) | Merchant/vendor name |
| Category | string(100) | e.g., "Groceries", "Entertainment" |
| Source | string(20) | `Bank` / `OCR` / `Manual` |
| Status | string(20) | `Pending` / `Confirmed` / `Flagged` |
| RawAiData | nvarchar(max) | Raw JSON from AI/OCR |
| IsSubscription | bool | Flagged by SubscriptionEngine |
| TransactionDate | DateTime | When the transaction occurred |

### Subscription

| Field | Type | Description |
|-------|------|-------------|
| Id | Guid | Primary key |
| UserId | Guid | Owner reference |
| ServiceName | string(200) | Canonical service name |
| MonthlyCost | decimal(18,2) | Average monthly cost |
| LastPaymentDate | DateTime | Most recent payment |
| LastActivityDate | DateTime? | Last usage (for AI tracking) |
| UsageScore | decimal(18,2) | 0–100 (below 20 = AtRisk) |
| Status | string(20) | `Active` / `AtRisk` / `Cancelled` |

---

## Rate Limiting

Two policies protect the API from abuse:

| Policy | Scope | Limit | Window | Applied To |
|--------|-------|-------|--------|-----------|
| `IpRateLimit` | Per IP address | 5 requests | 1 minute (sliding) | Auth endpoints |
| `UserRateLimit` | Per authenticated user | 40 requests | 1 minute (sliding) | All financial endpoints |

**When rate-limited (429):**
```json
{
  "error": "Too many requests. Please check the Retry-After header."
}
```

The `Retry-After` response header indicates how many seconds to wait.

---

## Seed Data

On first startup, the database is seeded with demo data:

**User:** Ahmed Hassan (`demo@baseera.com` / `Demo@123`) — Income: 25,000 EGP

**Accounts:**
| Provider | Balance | ID |
|----------|---------|-----|
| CIB | 18,500.75 | `11111111-1111-1111-1111-111111111111` |
| Vodafone Cash | 3,200.00 | `22222222-2222-2222-2222-222222222222` |

**Transactions:** 23 diverse transactions including:
- **Recurring:** Netflix (×3), Spotify (×3), Gold's Gym (×3), Adobe (×2), LinkedIn (×2)
- **One-off:** Carrefour, Uber, Zara, Amazon, Electricity, etc.
- **OCR:** 1 pending transaction from "Street Vendor"

**Subscriptions:**
| Service | Cost/mo | Usage Score | Status |
|---------|---------|-------------|--------|
| Netflix | 199.99 | 85 | Active |
| Spotify | 49.99 | 72 | Active |
| Gold's Gym | 500.00 | 12 | AtRisk ⚠️ |
| Adobe Creative Cloud | 239.99 | 8 | AtRisk ⚠️ |
| LinkedIn Premium | 149.99 | 45 | Active |

---

## Configuration

### Connection String (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=Baseera;Integrated Security=SSPI;TrustServerCertificate=True;"
  }
}
```

### JWT Settings

```json
{
  "Jwt": {
    "Key": "<your-secret-key-min-32-chars>",
    "Issuer": "Baseera.Api",
    "Audience": "Baseera.Client"
  }
}
```

> ⚠️ **Never commit the JWT key to source control.** Use environment variables or user secrets in production.

---

## Error Handling

All errors return structured JSON:

```json
{
  "status": 500,
  "message": "An unexpected error occurred. Please try again later.",
  "timestamp": "2026-04-28T22:00:00Z"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — validation failure |
| 401 | Unauthorized — missing or invalid JWT |
| 403 | Forbidden — resource belongs to another user |
| 404 | Not Found — resource doesn't exist |
| 409 | Conflict — duplicate resource (e.g., email) |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error — unexpected failure |

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | .NET 8 |
| Database | SQL Server (LocalDB) |
| ORM | Entity Framework Core 8 |
| Auth | ASP.NET Core Identity + JWT Bearer |
| API Docs | Swagger / Swashbuckle 6.9 |
| Rate Limiting | .NET 8 built-in RateLimiter |

---

*Built for the FinTech Hackathon by the Baseera Team* 🚀
