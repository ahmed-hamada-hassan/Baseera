using System.Security.Claims;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Baseera.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableRateLimiting("UserRateLimit")]
public class DashboardController : ControllerBase
{
    private readonly IFinancialInsightsService _insightsService;
    private readonly UserManager<ApplicationUser> _userManager;

    public DashboardController(
        IFinancialInsightsService insightsService,
        UserManager<ApplicationUser> userManager)
    {
        _insightsService = insightsService;
        _userManager = userManager;
    }

    /// <summary>
    /// GET Financial Health Overview.
    /// Returns total spend, remaining budget, at-risk subscriptions, and spend-by-category breakdown.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = GetUserId();
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user == null)
            return NotFound(new { message = "User not found." });

        var dashboard = await _insightsService.GetDashboardAsync(userId);

        return Ok(dashboard);
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                       ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userIdClaim!;
    }
}
