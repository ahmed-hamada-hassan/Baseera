# Baseera.Api — FinTech Hackathon MVP

Build a production-ready .NET 8 Web API managing personal finances with AI-driven subscription detection.

## Proposed Changes

### 1. Project Scaffold

Create the .NET 8 Web API project using `dotnet new webapi` in `d:\Baseera`, then install required NuGet packages:

| Package | Purpose |
|---|---|
| `Microsoft.AspNetCore.Identity.EntityFrameworkCore` | Identity + EF Core integration |
| `Microsoft.EntityFrameworkCore.SqlServer` | SQL Server provider |
| `Microsoft.EntityFrameworkCore.Tools` | Migrations tooling |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | JWT auth |
| `System.Threading.RateLimiting` | Built-in rate limiting |

Folder structure created manually under the single project:

```
Baseera.Api/
├── Domain/
│   ├── Entities/        # User, Account, Transaction, Subscription
│   └── Enums/           # TransactionSource, TransactionStatus, SubscriptionStatus
├── Application/
│   ├── DTOs/            # Request/Response DTOs for each controller
│   ├── Interfaces/      # IAccountRepository, ITransactionRepository, etc.
│   └── Services/        # BankSyncService, SubscriptionEngine, FinancialInsightsService, OCRService
├── Infrastructure/
│   ├── Data/            # AppDbContext, Seed data, Configurations
│   ├── Identity/        # ApplicationUser (extends IdentityUser), JWT helper
│   └── Repositories/    # EF Core implementations of interfaces
├── Web/
│   ├── Controllers/     # Auth, Accounts, Transactions, Subscriptions, Dashboard
│   ├── Middleware/       # Global exception handler
│   └── Configurations/  # Rate limiting, JWT, Swagger configs
└── MockData/            # mock_transactions.json
```

---

### 2. Domain Layer

#### [NEW] Domain/Entities/User.cs
Core `User` entity: `Guid Id`, `string FirstName`, `string LastName`, `decimal MonthlyIncome`. Linked 1:N to Accounts, Transactions, Subscriptions.

#### [NEW] Domain/Entities/Account.cs
`Guid Id`, `Guid UserId`, `string ProviderName`, `decimal Balance`.

#### [NEW] Domain/Entities/Transaction.cs
Full transaction entity with `AccountId` nullable, `RawAiData` as `nvarchar(max)`, `IsSubscription` flag, and all required fields.

#### [NEW] Domain/Entities/Subscription.cs
Subscription tracking with `UsageScore` (0-100), `LastActivityDate` nullable, `Status` enum-backed string.

#### [NEW] Domain/Enums/TransactionSource.cs, TransactionStatus.cs, SubscriptionStatus.cs
Enums for `Bank/OCR/Manual`, `Pending/Confirmed/Flagged`, `Active/AtRisk/Cancelled`.

---

### 3. Infrastructure Layer

#### [NEW] Infrastructure/Identity/ApplicationUser.cs
Extends `IdentityUser` — bridges ASP.NET Identity with our `User` entity. Contains `FirstName`, `LastName`, `MonthlyIncome` directly on the identity user (simplifies the model for MVP).

#### [NEW] Infrastructure/Data/AppDbContext.cs
Inherits `IdentityDbContext<ApplicationUser>`. Configures all entities with Fluent API:
- All `decimal` columns → `decimal(18,2)`
- `RawAiData` → `nvarchar(max)`
- Relationships configured (User→Accounts, User→Transactions, etc.)

#### [NEW] Infrastructure/Data/SeedData.cs
Static class that seeds:
- 1 default user (with Identity account, password `Demo@123`)
- 2 accounts (CIB Bank, Vodafone Cash)
- 20+ diverse transactions (Netflix, Spotify, Gym, Uber, groceries, etc.) with recurring patterns
- 5 subscriptions (Netflix, Spotify, Gym, Adobe, LinkedIn Premium)

#### [NEW] Infrastructure/Repositories/
EF Core repository implementations for Account, Transaction, Subscription.

---

### 4. Application Layer

#### [NEW] Application/DTOs/
- `RegisterDto`, `LoginDto`, `AuthResponseDto`
- `AccountDto`, `TransactionDto`, `SubscriptionDto`
- `OcrResultDto`, `UpdateTransactionStatusDto`
- `DashboardDto`, `FinancialHealthDto`

#### [NEW] Application/Interfaces/
- `IAccountRepository`, `ITransactionRepository`, `ISubscriptionRepository`
- `IBankSyncService`, `ISubscriptionEngine`, `IFinancialInsightsService`, `IOCRService`

#### [NEW] Application/Services/BankSyncService.cs
Reads `MockData/mock_transactions.json`, maps entries to `Transaction` entities, saves to DB. Simulates Open Banking.

#### [NEW] Application/Services/SubscriptionEngine.cs
**Implicit Linking logic:**
1. Scans transactions, groups by `MerchantName` (case-insensitive, trimmed).
2. Uses fuzzy-ish matching: `Contains` + `StartsWith` to handle variations like "NETFLIX.COM" vs "Netflix".
3. If a merchant appears ≥2 times in the last 90 days → flags as subscription.
4. Creates/updates `Subscription` records, sets `IsSubscription = true` on matching transactions.

#### [NEW] Application/Services/FinancialInsightsService.cs
Detects "At-Risk" subscriptions:
- `UsageScore < 20` → At-Risk
- `(DateTime.UtcNow - LastActivityDate).TotalDays > 30` → At-Risk
Returns dashboard data with total spend, remaining budget, at-risk list.

#### [NEW] Application/Services/OCRService.cs
Accepts AI-processed bill data, creates a `Transaction` with `Source = OCR`, `Status = Pending`.

---

### 5. Web Layer

#### [NEW] Web/Controllers/AuthController.cs
- `POST /api/auth/register` — creates Identity user + sets `MonthlyIncome`. `[AllowAnonymous]`
- `POST /api/auth/login` — validates credentials, returns JWT. `[AllowAnonymous]`

#### [NEW] Web/Controllers/AccountsController.cs
- `GET /api/accounts` — list user's accounts. `[Authorize]`
- `POST /api/accounts/sync` — triggers BankSyncService. `[Authorize]`

#### [NEW] Web/Controllers/TransactionsController.cs
- `GET /api/transactions` — history with optional filters. `[Authorize]`
- `POST /api/transactions/ocr` — receive OCR result. `[Authorize]`
- `PATCH /api/transactions/{id}/status` — update status. `[Authorize]`

#### [NEW] Web/Controllers/SubscriptionsController.cs
- `GET /api/subscriptions` — list subscriptions. `[Authorize]`
- `PATCH /api/subscriptions/{id}/cancel` — cancel subscription. `[Authorize]`

#### [NEW] Web/Controllers/DashboardController.cs
- `GET /api/dashboard` — financial health overview. `[Authorize]`

#### [NEW] Web/Middleware/GlobalExceptionMiddleware.cs
Catches unhandled exceptions, returns structured JSON error responses.

#### [NEW] Web/Configurations/RateLimitingConfig.cs
- Fixed Window for IP: 100 requests / minute
- Sliding Window for authenticated user: 50 requests / minute (applied to financial endpoints)

---

### 6. Program.cs Configuration

Wires everything together:
1. EF Core + SQL Server connection
2. ASP.NET Identity
3. JWT Authentication (24h expiry)
4. Rate Limiting policies
5. Swagger with JWT support
6. DI registrations for all services/repositories
7. Global exception middleware
8. Seed data on startup

---

## Design Decisions

> [!IMPORTANT]
> **Simplified Identity Model**: Instead of a separate `User` entity + `ApplicationUser`, I'll put `FirstName`, `LastName`, and `MonthlyIncome` directly on `ApplicationUser` (which extends `IdentityUser`). This avoids a redundant join table for the MVP while keeping the domain clean.

> [!NOTE]
> **Subscription Detection**: The "Implicit Linking" uses normalized merchant name matching (lowercase, trim, remove punctuation) plus a `Contains` check to handle variations like "NETFLIX.COM" vs "Netflix Inc." — good enough for a hackathon demo.

> [!NOTE]
> **SQL Server Connection**: The `appsettings.json` will use `Server=(localdb)\\mssqllocaldb` as default. You can override via environment variable or change the connection string.

## Open Questions

1. **SQL Server instance**: Should I target `(localdb)\mssqllocaldb` (Visual Studio default) or a full SQL Server instance? I'll default to LocalDB.
2. **Do you want me to run EF migrations automatically on startup** (for demo convenience), or leave it manual?

## Verification Plan

### Automated Tests
- `dotnet build` — ensure clean compilation
- `dotnet run` — verify startup and Swagger UI loads
- Seed data verification via Swagger endpoints

### Manual Verification
- Register a new user via Swagger
- Login and get JWT token
- Use token to call protected endpoints
- Trigger bank sync → verify transactions populated
- Call subscription detection → verify subscriptions created
- Check dashboard for financial health data
