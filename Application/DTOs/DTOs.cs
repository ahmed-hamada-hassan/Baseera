using System.ComponentModel.DataAnnotations;

namespace Baseera.Api.Application.DTOs;

// ── Auth DTOs ────────────────────────────────────────────────────────────

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Set during onboarding — used for budget calculations.
    /// </summary>
    [Range(0, double.MaxValue)]
    public decimal MonthlyIncome { get; set; }
}

public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}

// ── Account DTOs ─────────────────────────────────────────────────────────

public class AccountDto
{
    public Guid Id { get; set; }
    public string ProviderName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
}

public class SyncRequestDto
{
    [Required]
    public Guid AccountId { get; set; }
}

// ── Transaction DTOs ─────────────────────────────────────────────────────

public class TransactionDto
{
    public Guid Id { get; set; }
    public Guid? AccountId { get; set; }
    public decimal Amount { get; set; }
    public string MerchantName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsSubscription { get; set; }
    public DateTime TransactionDate { get; set; }
}

public class OcrResultDto
{
    [Required]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(250)]
    public string MerchantName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Raw JSON from the AI/OCR processor.
    /// </summary>
    public string? RawAiData { get; set; }
}

public class UpdateTransactionStatusDto
{
    /// <summary>
    /// Accepted values: Pending, Confirmed, Flagged
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = string.Empty;
}

// ── Subscription DTOs ────────────────────────────────────────────────────

public class SubscriptionDto
{
    public Guid Id { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public decimal MonthlyCost { get; set; }
    public DateTime LastPaymentDate { get; set; }
    public DateTime? LastActivityDate { get; set; }
    public decimal UsageScore { get; set; }
    public string Status { get; set; } = string.Empty;
}

// ── Dashboard DTOs ───────────────────────────────────────────────────────

public class DashboardDto
{
    public decimal MonthlyIncome { get; set; }
    public decimal TotalSpendThisMonth { get; set; }
    public decimal RemainingBudget { get; set; }
    public decimal TotalSubscriptionCost { get; set; }
    public int ActiveSubscriptions { get; set; }
    public int AtRiskSubscriptions { get; set; }
    public List<SubscriptionDto> AtRiskSubscriptionsList { get; set; } = new();
    public List<SpendByCategoryDto> SpendByCategory { get; set; } = new();
}

public class SpendByCategoryDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
