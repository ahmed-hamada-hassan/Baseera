using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Baseera.Api.Infrastructure.Identity;

/// <summary>
/// Extends IdentityUser with application-specific profile fields.
/// Serves as the unified User entity for the MVP.
/// </summary>
public class ApplicationUser : IdentityUser
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// User's declared monthly income for budget calculations.
    /// </summary>
    public decimal MonthlyIncome { get; set; }
}
