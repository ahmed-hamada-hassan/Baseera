using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Application.Services;
using Baseera.Api.Infrastructure.Data;
using Baseera.Api.Infrastructure.Identity;
using Baseera.Api.Infrastructure.Repositories;
using Baseera.Api.Web.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ══════════════════════════════════════════════════════════════════════════
// 1. DATABASE — Entity Framework Core + SQL Server
// ══════════════════════════════════════════════════════════════════════════
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ══════════════════════════════════════════════════════════════════════════
// 2. IDENTITY — ASP.NET Core Identity (using AddIdentityCore to avoid
//    overriding the default auth scheme to cookies)
// ══════════════════════════════════════════════════════════════════════════
builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    // Relaxed password rules for hackathon demo
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ══════════════════════════════════════════════════════════════════════════
// 3. JWT AUTHENTICATION
// ══════════════════════════════════════════════════════════════════════════
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear(); // Prevent default claim type mappings
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Allow HTTP for local dev
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ══════════════════════════════════════════════════════════════════════════
// 4. RATE LIMITING
// ══════════════════════════════════════════════════════════════════════════
builder.Services.AddRateLimiter(options => {
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
options.OnRejected = async (context, token) =>
{
    if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
    {
        context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds)
            .ToString(CultureInfo.InvariantCulture);
    }

    context.HttpContext.Response.ContentType = "application/json";
    await context.HttpContext.Response.WriteAsync(
        """{"error": "Too many requests. Please check the Retry-After header."}""",
        token
    );
};

options.AddPolicy("IpRateLimit", httpContext =>
    RateLimitPartition.GetSlidingWindowLimiter(
        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
        factory: _ => new SlidingWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6
        }));

options.AddPolicy("UserRateLimit", httpContext =>
{
    var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "Anonymous";

    return RateLimitPartition.GetSlidingWindowLimiter(
        partitionKey: userId,
        factory: _ => new SlidingWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 40,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6
        });
});
});

// ══════════════════════════════════════════════════════════════════════════
// 5. DEPENDENCY INJECTION — Repositories & Services
// ══════════════════════════════════════════════════════════════════════════
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<IBankSyncService, BankSyncService>();
builder.Services.AddScoped<ISubscriptionEngine, SubscriptionEngine>();
builder.Services.AddScoped<IFinancialInsightsService, FinancialInsightsService>();
builder.Services.AddScoped<IOCRService, OCRService>();

// ══════════════════════════════════════════════════════════════════════════
// 6. CONTROLLERS & SWAGGER
// ══════════════════════════════════════════════════════════════════════════
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Baseera API",
        Version = "v1",
        Description = "FinTech Hackathon MVP — Personal Finance Management with AI-Driven Subscription Detection",
        Contact = new OpenApiContact
        {
            Name = "Baseera Team",
            Email = "team@baseera.com"
        }
    });

    // JWT Bearer auth in Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ══════════════════════════════════════════════════════════════════════════
// 7. CORS (for frontend integration)
// ══════════════════════════════════════════════════════════════════════════
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE PIPELINE
// ══════════════════════════════════════════════════════════════════════════
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Baseera API v1");
        c.RoutePrefix = string.Empty; // Swagger at root URL
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ══════════════════════════════════════════════════════════════════════════
// SEED DATA — Auto-run on startup for demo
// ══════════════════════════════════════════════════════════════════════════
await SeedData.InitializeAsync(app.Services);

app.Run();
