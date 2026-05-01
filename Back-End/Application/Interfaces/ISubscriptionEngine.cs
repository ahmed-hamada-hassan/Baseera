namespace Baseera.Api.Application.Interfaces;

public interface ISubscriptionEngine
{
    /// <summary>
    /// Scans transactions and detects recurring patterns to identify subscriptions.
    /// Uses implicit linking with case-insensitive fuzzy matching.
    /// </summary>
    Task<int> DetectSubscriptionsAsync(string userId);
}
