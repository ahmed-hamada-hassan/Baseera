using System.Text.RegularExpressions;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Entities;
using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Application.Services;

/// <summary>
/// Detects subscriptions by analyzing transaction patterns.
/// Uses Implicit Linking — case-insensitive fuzzy matching on merchant names.
/// </summary>
public class SubscriptionEngine : ISubscriptionEngine
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly ISubscriptionRepository _subscriptionRepo;
    private readonly ILogger<SubscriptionEngine> _logger;

    // Known subscription service name mappings for fuzzy matching
    private static readonly Dictionary<string, string> KnownServiceMappings = new(StringComparer.OrdinalIgnoreCase)
    {
        { "netflix", "Netflix" },
        { "spotify", "Spotify" },
        { "gym", "Gym" },
        { "gold", "Gold's Gym" },
        { "adobe", "Adobe Creative Cloud" },
        { "linkedin", "LinkedIn Premium" },
        { "apple", "Apple Music" },
        { "youtube", "YouTube Premium" },
        { "amazon prime", "Amazon Prime" },
        { "hulu", "Hulu" },
        { "disney", "Disney+" },
    };

    public SubscriptionEngine(
        ITransactionRepository transactionRepo,
        ISubscriptionRepository subscriptionRepo,
        ILogger<SubscriptionEngine> logger)
    {
        _transactionRepo = transactionRepo;
        _subscriptionRepo = subscriptionRepo;
        _logger = logger;
    }

    public async Task<int> DetectSubscriptionsAsync(Guid userId)
    {
        var cutoff = DateTime.UtcNow.AddDays(-90);
        var transactions = await _transactionRepo.GetByUserIdAndDateRangeAsync(userId, cutoff, DateTime.UtcNow);

        // Group transactions by normalized merchant name
        var grouped = transactions
            .GroupBy(t => NormalizeMerchantName(t.MerchantName))
            .Where(g => g.Count() >= 2) // At least 2 occurrences = likely subscription
            .ToList();

        int detected = 0;

        foreach (var group in grouped)
        {
            var normalizedName = group.Key;
            var canonicalName = ResolveServiceName(normalizedName);
            var avgAmount = group.Average(t => t.Amount);
            var lastPayment = group.Max(t => t.TransactionDate);

            // Check if subscription already exists
            var existing = await _subscriptionRepo.GetByServiceNameAsync(userId, canonicalName);

            if (existing == null)
            {
                var subscription = new Subscription
                {
                    UserId = userId,
                    ServiceName = canonicalName,
                    MonthlyCost = Math.Round(avgAmount, 2),
                    LastPaymentDate = lastPayment,
                    LastActivityDate = lastPayment,
                    UsageScore = 50, // Default — will be evaluated by FinancialInsightsService
                    Status = SubscriptionStatus.Active.ToString()
                };

                await _subscriptionRepo.AddAsync(subscription);
                detected++;
                _logger.LogInformation("Detected new subscription: {Name} (avg {Amount}/mo)", canonicalName, avgAmount);
            }
            else
            {
                // Update existing subscription with latest data
                existing.LastPaymentDate = lastPayment;
                existing.MonthlyCost = Math.Round(avgAmount, 2);
                await _subscriptionRepo.UpdateAsync(existing);
            }

            // Mark matching transactions as subscription
            foreach (var tx in group.Where(t => !t.IsSubscription))
            {
                var tracked = await _transactionRepo.GetByIdAsync(tx.Id);
                if (tracked != null)
                {
                    tracked.IsSubscription = true;
                    await _transactionRepo.UpdateAsync(tracked);
                }
            }
        }

        _logger.LogInformation("Subscription detection complete. {Count} new subscriptions found for user {UserId}", detected, userId);
        return detected;
    }

    /// <summary>
    /// Normalizes merchant names for comparison:
    /// lowercase, strip punctuation, trim whitespace.
    /// </summary>
    private static string NormalizeMerchantName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return string.Empty;

        // Lowercase and trim
        var normalized = name.Trim().ToLowerInvariant();

        // Remove common suffixes
        normalized = Regex.Replace(normalized, @"\.(com|org|net|eg|io)$", "", RegexOptions.IgnoreCase);

        // Remove punctuation and extra spaces
        normalized = Regex.Replace(normalized, @"[^a-z0-9\s]", "");
        normalized = Regex.Replace(normalized, @"\s+", " ").Trim();

        // Try to match against known services
        foreach (var kvp in KnownServiceMappings)
        {
            if (normalized.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                return kvp.Key;
        }

        return normalized;
    }

    /// <summary>
    /// Resolves a normalized name to a canonical service name.
    /// </summary>
    private static string ResolveServiceName(string normalizedName)
    {
        foreach (var kvp in KnownServiceMappings)
        {
            if (normalizedName.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                return kvp.Value;
        }

        // Capitalize first letter of each word for unknown services
        return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(normalizedName);
    }
}
