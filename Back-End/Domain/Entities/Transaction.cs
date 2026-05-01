using System.ComponentModel.DataAnnotations;
using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Domain.Entities;

/// <summary>
/// Represents a financial transaction (bank, OCR, or manual entry).
/// </summary>
public class Transaction
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Nullable — cash/OCR transactions may not belong to a specific account.
    /// </summary>
    public string? AccountId { get; set; }

    public decimal Amount { get; set; }

    [Required]
    [MaxLength(250)]
    public string MerchantName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Source { get; set; } = TransactionSource.Manual.ToString();

    [MaxLength(20)]
    public string Status { get; set; } = TransactionStatus.Confirmed.ToString();

    /// <summary>
    /// Raw AI/OCR JSON data stored as NVARCHAR(MAX).
    /// </summary>
    public string? RawAiData { get; set; }

    public bool IsSubscription { get; set; }

    public DateTime TransactionDate { get; set; }

    // Navigation
    public virtual Account? Account { get; set; }
}
