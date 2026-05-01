using System.Security.Claims;
using Baseera.Api.Application.DTOs;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Baseera.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableRateLimiting("UserRateLimit")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionRepository _subscriptionRepo;
    private readonly IFinancialInsightsService _insightsService;

    public SubscriptionsController(
        ISubscriptionRepository subscriptionRepo,
        IFinancialInsightsService insightsService)
    {
        _subscriptionRepo = subscriptionRepo;
        _insightsService = insightsService;
    }

    /// <summary>
    /// GET all subscriptions for the authenticated user.
    /// Triggers at-risk evaluation before returning results.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetSubscriptions()
    {
        var userId = GetUserId();

        // Evaluate subscriptions for at-risk status
        await _insightsService.EvaluateSubscriptionsAsync(userId);

        var subscriptions = await _subscriptionRepo.GetByUserIdAsync(userId);

        var dtos = subscriptions.Select(s => new SubscriptionDto
        {
            Id = s.Id,
            ServiceName = s.ServiceName,
            MonthlyCost = s.MonthlyCost,
            LastPaymentDate = s.LastPaymentDate,
            LastActivityDate = s.LastActivityDate,
            UsageScore = s.UsageScore,
            Status = s.Status
        });

        return Ok(dtos);
    }

    /// <summary>
    /// PATCH — Cancel a subscription (update status to Cancelled).
    /// </summary>
    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelSubscription(string id)
    {
        var subscription = await _subscriptionRepo.GetByIdAsync(id);
        if (subscription == null)
            return NotFound(new { message = "Subscription not found." });

        var userId = GetUserId();
        if (subscription.UserId != userId)
            return Forbid();

        if (subscription.Status == SubscriptionStatus.Cancelled.ToString())
            return BadRequest(new { message = "Subscription is already cancelled." });

        subscription.Status = SubscriptionStatus.Cancelled.ToString();
        await _subscriptionRepo.UpdateAsync(subscription);

        return Ok(new SubscriptionDto
        {
            Id = subscription.Id,
            ServiceName = subscription.ServiceName,
            MonthlyCost = subscription.MonthlyCost,
            LastPaymentDate = subscription.LastPaymentDate,
            LastActivityDate = subscription.LastActivityDate,
            UsageScore = subscription.UsageScore,
            Status = subscription.Status
        });
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                       ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userIdClaim!;
    }
}
