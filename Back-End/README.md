<div align="center">

# ⚙️ Baseera — Backend API

[![.NET](https://img.shields.io/badge/.NET-8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://learn.microsoft.com/en-us/aspnet/core/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![Entity Framework](https://img.shields.io/badge/Entity_Framework_Core-8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://learn.microsoft.com/en-us/ef/core/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

A production-ready REST API built with Clean Architecture principles, handling all financial data, authentication, and AI orchestration.

</div>

---

## ⚡ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | ASP.NET Core 8 | Web API hosting |
| **Language** | C# 12 | Server-side logic |
| **Architecture** | Clean Architecture | Separation of concerns (Web → Application → Domain → Infrastructure) |
| **Database** | Microsoft SQL Server | Relational data persistence |
| **ORM** | Entity Framework Core 8 | Database access and migrations |
| **Authentication** | ASP.NET Core Identity + JWT Bearer | User management and token-based auth |
| **API Documentation** | Swashbuckle / Swagger | Auto-generated OpenAPI specification |
| **Hosting** | runasp.net | Live deployment |

---

## 🚀 Getting Started

### Prerequisites

- **.NET SDK 8.0+** — [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** (or SQL Server Express / LocalDB)
- **Visual Studio 2022** or **VS Code** with C# extension

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/your-org/Baseera.git
cd Baseera/Back-End

# 2. Restore NuGet packages
dotnet restore

# 3. Configure environment variables (see section below)
# Edit appsettings.Development.json with your connection string

# 4. Apply database migrations
dotnet ef database update

# 5. Run the API
dotnet run
```

The API will be available at **http://localhost:5002** (or **https://localhost:7002**).

**Swagger UI:** `http://localhost:5002/swagger`

---

## 🔧 Environment Variables (appsettings.json)

> ⚠️ **Never commit secrets to source control.** Use `appsettings.Development.json` for local overrides or User Secrets.

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=BaseeraDb;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "your-super-secret-key-must-be-at-least-32-chars",
    "Issuer": "Baseera.Api",
    "Audience": "Baseera.Client"
  }
}
```

| Variable | Description | Required |
|----------|-------------|----------|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string | ✅ Yes |
| `Jwt:Key` | Secret key for signing JWT tokens (≥ 32 chars) | ✅ Yes |
| `Jwt:Issuer` | JWT token issuer claim | ✅ Yes |
| `Jwt:Audience` | JWT token audience claim | ✅ Yes |

---

## 📂 Project Structure

```
Back-End/
├── Web/                        # Presentation Layer (HTTP)
│   ├── Controllers/            # API endpoints per feature
│   │   ├── AuthController.cs
│   │   ├── DashboardController.cs
│   │   ├── TransactionsController.cs
│   │   ├── SubscriptionsController.cs
│   │   ├── AccountsController.cs
│   │   ├── AnalyticsController.cs
│   │   └── ChatbotController.cs
│   ├── Configurations/         # Swagger, CORS, Auth setup
│   └── Middleware/             # Global error handling
│
├── Application/                # Business Logic Layer
│   ├── DTOs/                   # Data Transfer Objects (Request/Response)
│   ├── Interfaces/             # Service contracts (IAuthService, etc.)
│   └── Services/               # Concrete service implementations
│
├── Domain/                     # Core Domain Layer (no dependencies)
│   ├── Entities/               # EF Core entity models (User, Transaction, etc.)
│   └── Enums/                  # Domain enumerations
│
├── Infrastructure/             # Data Access Layer
│   └── (EF Core DbContext, Repositories)
│
├── Migrations/                 # EF Core migration files
├── Program.cs                  # App bootstrap, DI container configuration
├── appsettings.json            # Default configuration
└── openapi.yaml                # Full OpenAPI specification
```

---

## 📡 API Documentation

Base URL: `http://baseera.runasp.net/api`

All protected endpoints require the header:
```
Authorization: Bearer <your_jwt_token>
```

### 🔐 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/Auth/register` | ❌ | Register a new user account |
| `POST` | `/Auth/login` | ❌ | Login and receive a JWT token |

**Login Request Body:**
```json
{
  "email": "demo@baseera.com",
  "password": "Demo@123"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-05-02T12:00:00Z"
}
```

---

### 📊 Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/Dashboard` | ✅ | Get dashboard summary (liquidity, KPIs, budgets, recent transactions) |

---

### 💸 Transactions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/Transactions` | ✅ | Get paginated list of user transactions |
| `POST` | `/Transactions` | ✅ | Create a manual transaction |
| `PATCH` | `/Transactions/{id}/status` | ✅ | Update transaction status (Pending → Confirmed) |
| `POST` | `/Transactions/ocr` | ✅ | Upload a receipt image for AI-powered data extraction |

**Create Transaction Request Body:**
```json
{
  "amount": 150.00,
  "merchantName": "Starbucks",
  "category": "Food",
  "transactionDate": "2026-05-01T18:00:00Z"
}
```

---

### 💳 Subscriptions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/Subscriptions` | ✅ | Get all user subscriptions with risk analysis |
| `POST` | `/Subscriptions` | ✅ | Add a new subscription |
| `DELETE` | `/Subscriptions/{id}` | ✅ | Remove a subscription |

---

### 🏦 Accounts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/Accounts` | ✅ | Get all linked bank/wallet accounts |
| `POST` | `/Accounts` | ✅ | Link a new account |

---

### 📈 Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/Analytics` | ✅ | Get spending breakdown and trends for charts |

---

> 📄 For the full OpenAPI specification, see [`openapi.yaml`](./openapi.yaml) or visit `/swagger` on a running instance.
