using System.Text.Json;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Entities;
using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Application.Services;

/// <summary>
/// Mock Open Banking service — reads transactions from a local JSON file.
/// </summary>
public class BankSyncService : IBankSyncService
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<BankSyncService> _logger;

    public BankSyncService(
        ITransactionRepository transactionRepo,
        IWebHostEnvironment env,
        ILogger<BankSyncService> logger)
    {
        _transactionRepo = transactionRepo;
        _env = env;
        _logger = logger;
    }

    public async Task<int> SyncTransactionsAsync(string userId, string accountId)
    {
        var filePath = Path.Combine(_env.ContentRootPath, "MockData", "mock_transactions.json");

        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Mock data file not found at {Path}", filePath);
            return 0;
        }

        var json = await File.ReadAllTextAsync(filePath);
        var mockEntries = JsonSerializer.Deserialize<List<MockTransaction>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (mockEntries == null || mockEntries.Count == 0)
            return 0;

        var transactions = mockEntries.Select(m => new Transaction
        {
            UserId = userId,
            AccountId = accountId,
            Amount = m.Amount,
            MerchantName = m.MerchantName,
            Category = m.Category,
            Source = TransactionSource.Bank.ToString(),
            Status = TransactionStatus.Confirmed.ToString(),
            IsSubscription = false,
            TransactionDate = m.TransactionDate,
            RawAiData = m.RawData
        }).ToList();

        await _transactionRepo.AddRangeAsync(transactions);
        _logger.LogInformation("Synced {Count} transactions for user {UserId}", transactions.Count, userId);

        return transactions.Count;
    }

    public async Task<decimal> GetAccountBalanceAsync(string providerName, ProviderType providerType)
    {
        // Mocking a delay to simulate network call
        await Task.Delay(500);

        // Return a deterministic mock balance based on the provider name
        return providerName.ToLower() switch
        {
            "cib" or "cib bank" => 25450.75m,
            "qnb" or "qnb bank" => 12800.00m,
            "vodafone cash" => 4200.50m,
            "instapay" => 1500.00m,
            _ => new Random().Next(1000, 50000) / 1.0m // Random balance if provider unknown
        };
    }

    private class MockTransaction
    {
        public decimal Amount { get; set; }
        public string MerchantName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string? RawData { get; set; }
    }
}
