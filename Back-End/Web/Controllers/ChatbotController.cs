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
public class ChatbotController : ControllerBase
{
    private readonly ITransactionRepository _transactionRepo;

    public ChatbotController(ITransactionRepository transactionRepo)
    {
        _transactionRepo = transactionRepo;
    }

    [HttpPost("message")]
    public async Task<IActionResult> PostMessage([FromBody] ChatMessageRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Message cannot be empty." });

        var userId = GetUserId();
        // Fetch all user transactions to perform analysis
        var transactions = await _transactionRepo.GetByUserIdAsync(userId, 1, int.MaxValue);
        
        var msg = request.Message.ToLowerInvariant();
        string replyText;
        ChartDataDto? chartData = null;

        if (msg.Contains("uber") || msg.Contains("transport") || msg.Contains("ride"))
        {
            var uberSpend = transactions
                .Where(t => t.Status == "Confirmed" && 
                           (t.MerchantName?.ToLower().Contains("uber") == true || 
                            t.Category?.ToLower().Contains("transport") == true))
                .Sum(t => t.Amount);

            replyText = $"You spent {uberSpend:C} on Uber/Transport.";
            chartData = new ChartDataDto
            {
                Labels = new List<string> { "Uber/Transport", "Other Spend" },
                Values = new List<decimal> { uberSpend, Math.Max(0, transactions.Sum(t => t.Amount) - uberSpend) }
            };
        }
        else if (msg.Contains("grocer") || msg.Contains("food") || msg.Contains("eat"))
        {
            var foodSpend = transactions
                .Where(t => t.Status == "Confirmed" &&
                           (t.Category?.ToLower().Contains("food") == true || 
                            t.Category?.ToLower().Contains("grocer") == true ||
                            t.Category?.ToLower().Contains("dining") == true))
                .Sum(t => t.Amount);

            replyText = $"You spent {foodSpend:C} on Food & Groceries.";
            chartData = new ChartDataDto
            {
                Labels = new List<string> { "Food & Groceries", "Other Spend" },
                Values = new List<decimal> { foodSpend, Math.Max(0, transactions.Sum(t => t.Amount) - foodSpend) }
            };
        }
        else if (msg.Contains("spend") || msg.Contains("summary") || msg.Contains("total"))
        {
            var totalSpend = transactions.Where(t => t.Status == "Confirmed").Sum(t => t.Amount);
            replyText = $"Your total spending is {totalSpend:C}. Here is a breakdown by category.";
            
            var byCategory = transactions
                .Where(t => t.Amount > 0 && t.Status == "Confirmed")
                .GroupBy(t => t.Category ?? "Uncategorized")
                .Select(g => new { Category = g.Key, Amount = g.Sum(t => t.Amount) })
                .OrderByDescending(x => x.Amount)
                .ToList();

            chartData = new ChartDataDto
            {
                Labels = byCategory.Select(x => x.Category).ToList(),
                Values = byCategory.Select(x => x.Amount).ToList()
            };
        }
        else
        {
            replyText = "I'm still learning! You can ask me things like 'How much did I spend on Uber?' or 'What is my spending summary?'.";
        }

        var response = new ChatMessageResponseDto
        {
            TextReply = replyText,
            ChartData = chartData
        };

        return Ok(response);
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                       ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userIdClaim!;
    }
}
