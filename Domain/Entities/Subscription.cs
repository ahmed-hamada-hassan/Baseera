using System.ComponentModel.DataAnnotations;
using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Domain.Entities;

/// <summary>
/// Tracks user subscriptions with usage scoring and risk detection.
/// </summary>
public class Subscription
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string ServiceName { get; set; } = string.Empty;

    public decimal MonthlyCost { get; set; }

    public DateTime LastPaymentDate { get; set; }

    /// <summary>
    /// Updated by AI/usage tracking — null if never evaluated.
    /// </summary>
    public DateTime? LastActivityDate { get; set; }

    /// <summary>
    /// Usage score 0-100 (higher = more used). Below 20 = At-Risk.
    /// </summary>
    public decimal UsageScore { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = SubscriptionStatus.Active.ToString();
}
