using System.IdentityModel.Tokens.Jwt;
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
public class AccountsController : ControllerBase
{
    private readonly IAccountRepository _accountRepo;
    private readonly IBankSyncService _bankSyncService;
    private readonly ISubscriptionEngine _subscriptionEngine;

    public AccountsController(
        IAccountRepository accountRepo,
        IBankSyncService bankSyncService,
        ISubscriptionEngine subscriptionEngine)
    {
        _accountRepo = accountRepo;
        _bankSyncService = bankSyncService;
        _subscriptionEngine = subscriptionEngine;
    }

    /// <summary>
    /// List all accounts for the authenticated user.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAccounts()
    {
        var userId = GetUserId();
        var accounts = await _accountRepo.GetByUserIdAsync(userId);

        var dtos = accounts.Select(a => new AccountDto
        {
            Id = a.Id,
            ProviderName = a.ProviderName,
            Balance = a.Balance
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Sync transactions from the (mocked) Open Banking API.
    /// Also triggers subscription detection after sync.
    /// </summary>
    [HttpPost("sync")]
    public async Task<IActionResult> Sync([FromBody] SyncRequestDto dto)
    {
        var userId = GetUserId();
        var account = await _accountRepo.GetByIdAsync(dto.AccountId);

        if (account == null || account.UserId != userId)
            return NotFound(new { message = "Account not found." });

        var synced = await _bankSyncService.SyncTransactionsAsync(userId, dto.AccountId);

        // Run subscription detection after syncing new transactions
        var detected = await _subscriptionEngine.DetectSubscriptionsAsync(userId);

        return Ok(new
        {
            message = $"Synced {synced} transactions. Detected {detected} new subscriptions.",
            transactionsSynced = synced,
            subscriptionsDetected = detected
        });
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                       ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}
