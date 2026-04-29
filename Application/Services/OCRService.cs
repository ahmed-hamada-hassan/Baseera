using Baseera.Api.Application.DTOs;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Entities;
using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Application.Services;

/// <summary>
/// Processes OCR/AI-extracted bill data and saves as pending transactions.
/// </summary>
public class OCRService : IOCRService
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly ILogger<OCRService> _logger;

    public OCRService(ITransactionRepository transactionRepo, ILogger<OCRService> logger)
    {
        _transactionRepo = transactionRepo;
        _logger = logger;
    }

    public async Task<TransactionDto> ProcessOcrResultAsync(Guid userId, OcrResultDto ocrResult)
    {
        var transaction = new Transaction
        {
            UserId = userId,
            AccountId = null, // OCR transactions are not linked to a specific account
            Amount = ocrResult.Amount,
            MerchantName = ocrResult.MerchantName,
            Category = ocrResult.Category,
            Source = TransactionSource.OCR.ToString(),
            Status = TransactionStatus.Pending.ToString(),
            RawAiData = ocrResult.RawAiData,
            IsSubscription = false,
            TransactionDate = ocrResult.TransactionDate
        };

        await _transactionRepo.AddAsync(transaction);
        _logger.LogInformation("OCR transaction created: {MerchantName} - {Amount}", ocrResult.MerchantName, ocrResult.Amount);

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
