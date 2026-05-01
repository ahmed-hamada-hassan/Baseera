using System.ComponentModel.DataAnnotations;
using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Domain.Entities;

/// <summary>
/// Represents a financial account linked to a user (e.g., CIB Bank, Vodafone Cash).
/// </summary>
public class Account
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;

    public ProviderType ProviderType { get; set; }

    [Required]
    [MaxLength(150)]
    public string ProviderName { get; set; } = string.Empty;

    public decimal Balance { get; set; }

    // Navigation
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
