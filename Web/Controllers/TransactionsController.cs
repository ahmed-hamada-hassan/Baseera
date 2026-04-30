using System.Security.Claims;
using Baseera.Api.Application.DTOs;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Entities;
using Baseera.Api.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Baseera.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableRateLimiting("UserRateLimit")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly IOCRService _ocrService;

    public TransactionsController(ITransactionRepository transactionRepo, IOCRService ocrService)
    {
        _transactionRepo = transactionRepo;
        _ocrService = ocrService;
    }

    /// <summary>
    /// GET transaction history with pagination.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTransactions([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var userId = GetUserId();
        var transactions = await _transactionRepo.GetByUserIdAsync(userId, page, pageSize);

        var dtos = transactions.Select(t => new TransactionDto
        {
            Id = t.Id,
            AccountId = t.AccountId,
            Amount = t.Amount,
            MerchantName = t.MerchantName,
            Category = t.Category,
            Source = t.Source,
            Status = t.Status,
            IsSubscription = t.IsSubscription,
            TransactionDate = t.TransactionDate
        });

        return Ok(dtos);
    }

    /// <summary>
    /// POST receipt image. Creates a Confirmed transaction from AI extracted data.
    /// </summary>
    [HttpPost("ocr")]
    public async Task<IActionResult> PostOcrResult(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var userId = GetUserId();

        using var stream = file.OpenReadStream();
        var aiData = await _ocrService.ProcessImageAsync(stream);

        var transaction = new Transaction
        {
            UserId = userId,
            Amount = aiData.Amount,
            MerchantName = aiData.MerchantName,
            Category = aiData.Category,
            Source = TransactionSource.OCR.ToString(),
            Status = TransactionStatus.Confirmed.ToString(),
            RawAiData = aiData.RawAiData,
            IsSubscription = false,
            TransactionDate = aiData.TransactionDate
        };

        await _transactionRepo.AddAsync(transaction);

        var responseDto = new TransactionDto
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

        return CreatedAtAction(nameof(GetTransactions), null, responseDto);
    }

    /// <summary>
    /// PATCH transaction status (Pending → Confirmed/Flagged).
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTransactionStatusDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Validate status value
        if (!Enum.TryParse<TransactionStatus>(dto.Status, true, out _))
            return BadRequest(new { message = $"Invalid status. Accepted values: {string.Join(", ", Enum.GetNames<TransactionStatus>())}" });

        var transaction = await _transactionRepo.GetByIdAsync(id);
        if (transaction == null)
            return NotFound(new { message = "Transaction not found." });

        var userId = GetUserId();
        if (transaction.UserId != userId)
            return Forbid();

        transaction.Status = dto.Status;
        await _transactionRepo.UpdateAsync(transaction);

        return Ok(new TransactionDto
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
        });
    }

    /// <summary>
    /// POST manual transaction. Creates a Confirmed transaction.
    /// </summary>
    [HttpPost("manual")]
    public async Task<IActionResult> PostManualTransaction([FromBody] ManualTransactionDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();

        var transaction = new Transaction
        {
            UserId = userId,
            Amount = dto.Amount,
            MerchantName = dto.Title,
            Category = dto.Category,
            TransactionDate = dto.TransactionDate,
            Source = TransactionSource.Manual.ToString(),
            Status = TransactionStatus.Confirmed.ToString()
        };

        await _transactionRepo.AddAsync(transaction);

        var responseDto = new TransactionDto
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

        return CreatedAtAction(nameof(GetTransactions), null, responseDto);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                       ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}
