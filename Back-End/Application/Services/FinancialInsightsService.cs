using Baseera.Api.Application.DTOs;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Application.Services;

/// <summary>
/// Analyzes financial health and detects at-risk subscriptions.
/// </summary>
public class FinancialInsightsService : IFinancialInsightsService
{
    private readonly ISubscriptionRepository _subscriptionRepo;
    private readonly ITransactionRepository _transactionRepo;
    private readonly IAccountRepository _accountRepo;
    private readonly ILogger<FinancialInsightsService> _logger;

    public FinancialInsightsService(
        ISubscriptionRepository subscriptionRepo,
        ITransactionRepository transactionRepo,
        IAccountRepository accountRepo,
        ILogger<FinancialInsightsService> logger)
    {
        _subscriptionRepo = subscriptionRepo;
        _transactionRepo = transactionRepo;
        _accountRepo = accountRepo;
        _logger = logger;
    }

    public async Task<int> EvaluateSubscriptionsAsync(string userId)
    {
        var subscriptions = await _subscriptionRepo.GetByUserIdAsync(userId);
        int flagged = 0;

        foreach (var sub in subscriptions)
        {
            if (sub.Status == SubscriptionStatus.Cancelled.ToString())
                continue;

            bool isAtRisk = false;

            // Rule 1: UsageScore < 20
            if (sub.UsageScore < 20)
            {
                isAtRisk = true;
                _logger.LogInformation("Subscription {Name} flagged: UsageScore {Score} < 20", sub.ServiceName, sub.UsageScore);
            }

            // Rule 2: Inactive > 30 days
            if (sub.LastActivityDate.HasValue &&
                (DateTime.UtcNow - sub.LastActivityDate.Value).TotalDays > 30)
            {
                isAtRisk = true;
                _logger.LogInformation("Subscription {Name} flagged: inactive for {Days} days",
                    sub.ServiceName, (DateTime.UtcNow - sub.LastActivityDate.Value).TotalDays);
            }

            var newStatus = isAtRisk
                ? SubscriptionStatus.AtRisk.ToString()
                : SubscriptionStatus.Active.ToString();

            if (sub.Status != newStatus)
            {
                // Need to get the tracked entity to update
                var tracked = await _subscriptionRepo.GetByIdAsync(sub.Id);
                if (tracked != null)
                {
                    tracked.Status = newStatus;
                    await _subscriptionRepo.UpdateAsync(tracked);
                    if (isAtRisk) flagged++;
                }
            }
            else if (isAtRisk)
            {
                flagged++;
            }
        }

        return flagged;
    }

    public async Task<DashboardDto> GetDashboardAsync(string userId)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Evaluate subscriptions first
        await EvaluateSubscriptionsAsync(userId);

        var totalSpend = await _transactionRepo.GetTotalSpendAsync(userId, monthStart, now);
        var subscriptions = (await _subscriptionRepo.GetByUserIdAsync(userId)).ToList();

        var atRiskSubs = subscriptions
            .Where(s => s.Status == SubscriptionStatus.AtRisk.ToString())
            .Select(MapToDto)
            .ToList();

        var activeSubs = subscriptions
            .Where(s => s.Status != SubscriptionStatus.Cancelled.ToString())
            .ToList();

        // Spend by category
        var transactions = await _transactionRepo.GetByUserIdAndDateRangeAsync(userId, monthStart, now);
        var spendByCategory = transactions
            .GroupBy(t => string.IsNullOrWhiteSpace(t.Category) ? "Uncategorized" : t.Category)
            .Select(g => new SpendByCategoryDto
            {
                Category = g.Key,
                Amount = g.Sum(t => t.Amount)
            })
            .OrderByDescending(s => s.Amount)
            .ToList();

        // Get Accounts logic for Dashboard
        var accounts = await _accountRepo.GetByUserIdAsync(userId);
        var totalBank = accounts.Where(a => a.ProviderType == ProviderType.Bank).Sum(a => a.Balance);
        var totalEWallet = accounts.Where(a => a.ProviderType == ProviderType.EWallet).Sum(a => a.Balance);
        var totalHardCash = accounts.Where(a => a.ProviderType == ProviderType.HardCash).Sum(a => a.Balance);
        var totalLiquidity = totalBank + totalEWallet + totalHardCash;

        return new DashboardDto
        {
            TotalBankBalance = totalBank,
            TotalEWalletBalance = totalEWallet,
            HardCashBalance = totalHardCash,
            TotalLiquidity = totalLiquidity,
            TotalSpendThisMonth = totalSpend,
            TotalSubscriptionCost = activeSubs.Sum(s => s.MonthlyCost),
            ActiveSubscriptions = activeSubs.Count,
            AtRiskSubscriptions = atRiskSubs.Count,
            AtRiskSubscriptionsList = atRiskSubs,
            SpendByCategory = spendByCategory
        };
    }

    private static SubscriptionDto MapToDto(Domain.Entities.Subscription s) => new()
    {
        Id = s.Id,
        ServiceName = s.ServiceName,
        MonthlyCost = s.MonthlyCost,
        LastPaymentDate = s.LastPaymentDate,
        LastActivityDate = s.LastActivityDate,
        UsageScore = s.UsageScore,
        Status = s.Status
    };
}
