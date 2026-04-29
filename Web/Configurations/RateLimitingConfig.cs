using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace Baseera.Api.Web.Configurations;

/// <summary>
/// Configures .NET 8 global rate limiting policies.
/// </summary>
public static class RateLimitingConfig
{
    public static IServiceCollection AddRateLimitingPolicies(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // ── Fixed Window: 100 requests / minute per IP ──────────────
            options.AddFixedWindowLimiter("IpPolicy", opt =>
            {
                opt.PermitLimit = 100;
                opt.Window = TimeSpan.FromMinutes(1);
                opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                opt.QueueLimit = 5;
            });

            // ── Sliding Window: 50 requests / minute per user ───────────
            options.AddSlidingWindowLimiter("UserFinancialPolicy", opt =>
            {
                opt.PermitLimit = 50;
                opt.Window = TimeSpan.FromMinutes(1);
                opt.SegmentsPerWindow = 5;
                opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                opt.QueueLimit = 3;
            });

            // Global fallback — applied to all endpoints
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1)
                    });
            });
        });

        return services;
    }
}
