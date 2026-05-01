using Baseera.Api.Application.DTOs;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Entities;
using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly IAccountRepository _accountRepo;

    public TransactionService(ITransactionRepository transactionRepo, IAccountRepository accountRepo)
    {
        _transactionRepo = transactionRepo;
        _accountRepo = accountRepo;
    }

    public async Task<TransactionDto> AddManualTransactionAsync(string userId, ManualTransactionDto dto)
    {
        Account? account = null;

        if (!string.IsNullOrEmpty(dto.AccountId))
        {
            account = await _accountRepo.GetByIdAsync(dto.AccountId);
            if (account == null || account.UserId != userId)
                throw new ArgumentException("Invalid account specified.");

            // Ensure Bank transactions never get affected by HardCash or EWallet entries.
            // If they are posting manual entry, we just ensure we only apply adjustments to HardCash
        }
        else
        {
            // Default to the user's HardCash account if no account specified
            var accounts = await _accountRepo.GetByUserIdAsync(userId);
            account = accounts.FirstOrDefault(a => a.ProviderType == ProviderType.HardCash);
            
            if (account == null)
                throw new Exception("No HardCash account found for this user.");
        }

        // Auto-Reconciliation Logic for HardCash
        if (account.ProviderType == ProviderType.HardCash && account.Balance < dto.Amount)
        {
            decimal shortfall = dto.Amount - account.Balance;
            var adjustmentTransaction = new Transaction
            {
                UserId = userId,
                AccountId = account.Id,
                Amount = -shortfall, // Negative amount to represent income/adjustment
                MerchantName = "Initial Balance Adjustment",
                Category = "InitialBalance",
                TransactionDate = dto.TransactionDate,
                Source = TransactionSource.Manual.ToString(),
                Status = TransactionStatus.Confirmed.ToString()
            };

            await _transactionRepo.AddAsync(adjustmentTransaction);
            account.Balance += shortfall; 
        }

        // Update account balance for expense
        account.Balance -= dto.Amount;
        await _accountRepo.UpdateAsync(account);

        var transaction = new Transaction
        {
            UserId = userId,
            AccountId = account.Id,
            Amount = dto.Amount,
            MerchantName = dto.Title,
            Category = dto.Category,
            TransactionDate = dto.TransactionDate,
            Source = TransactionSource.Manual.ToString(),
            Status = TransactionStatus.Confirmed.ToString()
        };

        await _transactionRepo.AddAsync(transaction);

        return new TransactionDto
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            Amount = transaction.Amount,
            MerchantName = transaction.MerchantName,
            Category = transaction.Category,
            Source = transaction.Source,
            Status = transaction.Status,
            IsSubscription = transaction.IsSubscription,
            TransactionDate = transaction.TransactionDate
        };
    }
}
