using Baseera.Api.Application.DTOs;

namespace Baseera.Api.Application.Interfaces;

public interface IFinancialInsightsService
{
    /// <summary>
    /// Evaluates subscriptions and flags those that are at-risk
    /// (UsageScore &lt; 20 or inactive &gt; 30 days).
    /// </summary>
    Task<int> EvaluateSubscriptionsAsync(Guid userId);

    /// <summary>
    /// Returns a dashboard overview with total spend, budget remaining, and at-risk subscriptions.
    /// </summary>
    Task<DashboardDto> GetDashboardAsync(Guid userId, decimal monthlyIncome);
}
