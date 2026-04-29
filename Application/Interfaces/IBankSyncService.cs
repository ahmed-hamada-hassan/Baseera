namespace Baseera.Api.Application.Interfaces;

public interface IBankSyncService
{
    /// <summary>
    /// Simulates syncing transactions from an Open Banking API.
    /// Reads from mock JSON file and saves to database.
    /// </summary>
    Task<int> SyncTransactionsAsync(Guid userId, Guid accountId);
}
