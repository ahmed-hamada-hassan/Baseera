using System.Security.Claims;
using Baseera.Api.Application.DTOs;
using Baseera.Api.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Baseera.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableRateLimiting("UserRateLimit")]
public class AnalyticsController : ControllerBase
{
    private readonly ITransactionRepository _transactionRepo;

    public AnalyticsController(ITransactionRepository transactionRepo)
    {
        _transactionRepo = transactionRepo;
    }

    /// <summary>
    /// GET summary of total spending grouped by Category for the current user.
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var userId = GetUserId();
        
        var transactions = await _transactionRepo.GetByUserIdAsync(userId, 1, int.MaxValue);

        var summary = transactions
            .Where(t => t.Amount > 0 && t.Status == "Confirmed")
            .GroupBy(t => t.Category ?? "Uncategorized")
            .Select(g => new SpendByCategoryDto
            {
                Category = g.Key,
                Amount = g.Sum(t => t.Amount)
            })
            .OrderByDescending(x => x.Amount)
            .ToList();

        return Ok(summary);
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                       ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userIdClaim!;
    }
}
