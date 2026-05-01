using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Application.Interfaces;

public interface IBankSyncService
{
    /// <summary>
    /// Simulates syncing transactions from an Open Banking API.
    /// Reads from mock JSON file and saves to database.
    /// </summary>
    Task<int> SyncTransactionsAsync(string userId, string accountId);

    /// <summary>
    /// Simulates fetching the current balance from a provider.
    /// </summary>
    Task<decimal> GetAccountBalanceAsync(string providerName, ProviderType providerType);
}
