using Baseera.Api.Domain.Entities;
using Baseera.Api.Domain.Enums;
using Baseera.Api.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace Baseera.Api.Infrastructure.Data;

/// <summary>
/// Seeds the database with demo data on first startup.
/// Creates 1 user, 2 accounts, 20+ transactions, and 6 subscriptions.
/// </summary>
public static class SeedData
{
    // Fixed IDs for deterministic seeding
    public static readonly string DefaultUserId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    public static readonly string CibAccountId = "11111111-1111-1111-1111-111111111111";
    public static readonly string VodafoneAccountId = "22222222-2222-2222-2222-222222222222";
    public static readonly string HardCashAccountId = "33333333-3333-3333-3333-333333333333";

    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await context.Database.EnsureCreatedAsync();

        // ── Seed User ───────────────────────────────────────────────────
        if (await userManager.FindByEmailAsync("demo@baseera.com") == null)
        {
            var user = new ApplicationUser
            {
                Id = DefaultUserId,
                UserName = "demo@baseera.com",
                Email = "demo@baseera.com",
                EmailConfirmed = true,
                FirstName = "Ahmed",
                LastName = "Hassan"
            };

            await userManager.CreateAsync(user, "Demo@123");
        }

        // ── Seed Accounts ───────────────────────────────────────────────
        if (!context.Accounts.Any())
        {
            context.Accounts.AddRange(
                new Account
                {
                    Id = CibAccountId,
                    UserId = DefaultUserId,
                    ProviderName = "CIB",
                    ProviderType = ProviderType.Bank,
                    Balance = 18500.75m
                },
                new Account
                {
                    Id = VodafoneAccountId,
                    UserId = DefaultUserId,
                    ProviderName = "Vodafone Cash",
                    ProviderType = ProviderType.EWallet,
                    Balance = 3200.00m
                },
                new Account
                {
                    Id = HardCashAccountId,
                    UserId = DefaultUserId,
                    ProviderName = "Wallet",
                    ProviderType = ProviderType.HardCash,
                    Balance = 500.00m
                }
            );
            await context.SaveChangesAsync();
        }

        // ── Seed Transactions ───────────────────────────────────────────
        if (!context.Transactions.Any())
        {
            var userId = DefaultUserId;
            var now = DateTime.UtcNow;

            var transactions = new List<Transaction>
            {
                // Recurring — Netflix
                new() { UserId = userId, AccountId = CibAccountId, Amount = 199.99m, MerchantName = "Netflix", Category = "Entertainment", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-60) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 199.99m, MerchantName = "NETFLIX.COM", Category = "Entertainment", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-30) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 199.99m, MerchantName = "Netflix Inc", Category = "Entertainment", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-1) },

                // Recurring — Spotify
                new() { UserId = userId, AccountId = CibAccountId, Amount = 49.99m, MerchantName = "Spotify", Category = "Entertainment", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-58) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 49.99m, MerchantName = "SPOTIFY AB", Category = "Entertainment", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-28) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 49.99m, MerchantName = "Spotify Premium", Category = "Entertainment", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-2) },

                // Recurring — Gym (Gold's Gym)
                new() { UserId = userId, AccountId = CibAccountId, Amount = 500.00m, MerchantName = "Gold's Gym", Category = "Health & Fitness", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-62) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 500.00m, MerchantName = "GOLDS GYM CAIRO", Category = "Health & Fitness", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-32) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 500.00m, MerchantName = "Gold's Gym", Category = "Health & Fitness", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-3) },

                // Recurring — Adobe Creative Cloud
                new() { UserId = userId, AccountId = CibAccountId, Amount = 239.99m, MerchantName = "Adobe Creative Cloud", Category = "Software", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-55) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 239.99m, MerchantName = "ADOBE SYSTEMS", Category = "Software", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-25) },

                // Recurring — LinkedIn Premium
                new() { UserId = userId, AccountId = CibAccountId, Amount = 149.99m, MerchantName = "LinkedIn Premium", Category = "Professional", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-45) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 149.99m, MerchantName = "LINKEDIN CORP", Category = "Professional", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-15) },

                // Recurring — Disney Plus
                new() { UserId = userId, AccountId = CibAccountId, Amount = 120.00m, MerchantName = "Disney Plus", Category = "Entertainment", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-65) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 120.00m, MerchantName = "DISNEYPLUS", Category = "Entertainment", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-35) },

                // One-off transactions
                new() { UserId = userId, AccountId = CibAccountId, Amount = 1250.00m, MerchantName = "Carrefour", Category = "Groceries", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-10) },
                new() { UserId = userId, AccountId = VodafoneAccountId, Amount = 85.50m, MerchantName = "Uber", Category = "Transport", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-8) },
                new() { UserId = userId, AccountId = VodafoneAccountId, Amount = 120.00m, MerchantName = "Uber Eats", Category = "Food Delivery", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-5) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 3500.00m, MerchantName = "Zara", Category = "Shopping", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-12) },
                new() { UserId = userId, AccountId = VodafoneAccountId, Amount = 200.00m, MerchantName = "Vodafone Recharge", Category = "Telecom", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-7) },
                new() { UserId = userId, AccountId = HardCashAccountId, Amount = 350.00m, MerchantName = "Street Vendor", Category = "Food", Source = "OCR", Status = "Pending", IsSubscription = false, TransactionDate = now.AddDays(-4), RawAiData = "{\"confidence\":0.82,\"items\":[\"lunch\",\"drinks\"]}" },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 450.00m, MerchantName = "Amazon.eg", Category = "Shopping", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-6) },
                new() { UserId = userId, AccountId = HardCashAccountId, Amount = 75.00m, MerchantName = "Pharmacy", Category = "Health", Source = "Manual", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-2) },
                new() { UserId = userId, AccountId = CibAccountId, Amount = 1800.00m, MerchantName = "Electricity Bill", Category = "Utilities", Source = "Bank", Status = "Confirmed", IsSubscription = false, TransactionDate = now.AddDays(-20) },
            };

            context.Transactions.AddRange(transactions);
            await context.SaveChangesAsync();
        }

        // ── Seed Subscriptions ──────────────────────────────────────────
        if (!context.Subscriptions.Any())
        {
            var userId = DefaultUserId;
            var now = DateTime.UtcNow;

            context.Subscriptions.AddRange(
                new Subscription
                {
                    UserId = userId,
                    ServiceName = "Netflix",
                    MonthlyCost = 199.99m,
                    LastPaymentDate = now.AddDays(-1),
                    LastActivityDate = now.AddDays(-1),
                    UsageScore = 85,
                    Status = SubscriptionStatus.Active.ToString()
                },
                new Subscription
                {
                    UserId = userId,
                    ServiceName = "Spotify",
                    MonthlyCost = 49.99m,
                    LastPaymentDate = now.AddDays(-2),
                    LastActivityDate = now.AddDays(-2),
                    UsageScore = 72,
                    Status = SubscriptionStatus.Active.ToString()
                },
                new Subscription
                {
                    UserId = userId,
                    ServiceName = "Gold's Gym",
                    MonthlyCost = 500.00m,
                    LastPaymentDate = now.AddDays(-3),
                    LastActivityDate = now.AddDays(-45),  // Not used in 45 days → At-Risk
                    UsageScore = 12,                       // Below 20 → At-Risk
                    Status = SubscriptionStatus.AtRisk.ToString()
                },
                new Subscription
                {
                    UserId = userId,
                    ServiceName = "Adobe Creative Cloud",
                    MonthlyCost = 239.99m,
                    LastPaymentDate = now.AddDays(-25),
                    LastActivityDate = now.AddDays(-40),  // Not used in 40 days → At-Risk
                    UsageScore = 8,                        // Below 20 → At-Risk
                    Status = SubscriptionStatus.AtRisk.ToString()
                },
                new()
                {
                    UserId = userId,
                    ServiceName = "LinkedIn Premium",
                    MonthlyCost = 149.99m,
                    LastPaymentDate = now.AddDays(-15),
                    LastActivityDate = now.AddDays(-10),
                    UsageScore = 45,
                    Status = SubscriptionStatus.Active.ToString()
                },
                new Subscription
                {
                    UserId = userId,
                    ServiceName = "Disney Plus",
                    MonthlyCost = 120.00m,
                    LastPaymentDate = now.AddDays(-35),
                    LastActivityDate = now.AddDays(-40), // At-Risk: > 30 days
                    UsageScore = 15,                      // At-Risk: < 20
                    Status = SubscriptionStatus.AtRisk.ToString()
                }
            );
            await context.SaveChangesAsync();
        }
    }
}
