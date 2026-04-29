using System.ComponentModel.DataAnnotations;

namespace Baseera.Api.Domain.Entities;

/// <summary>
/// Represents a financial account linked to a user (e.g., CIB Bank, Vodafone Cash).
/// </summary>
public class Account
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    [Required]
    [MaxLength(150)]
    public string ProviderName { get; set; } = string.Empty;

    public decimal Balance { get; set; }

    // Navigation
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
