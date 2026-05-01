using Baseera.Api.Domain.Entities;
using Baseera.Api.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Baseera.Api.Infrastructure.Data;

/// <summary>
/// Application database context — integrates Identity with domain entities.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ── ApplicationUser ─────────────────────────────────────────────
        builder.Entity<ApplicationUser>(e =>
        {

        });

        // ── Account ─────────────────────────────────────────────────────
        builder.Entity<Account>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Balance).HasColumnType("decimal(18,2)");
            e.Property(a => a.ProviderName).IsRequired().HasMaxLength(150);

            e.HasMany(a => a.Transactions)
             .WithOne(t => t.Account)
             .HasForeignKey(t => t.AccountId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── Transaction ─────────────────────────────────────────────────
        builder.Entity<Transaction>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Amount).HasColumnType("decimal(18,2)");
            e.Property(t => t.MerchantName).IsRequired().HasMaxLength(250);
            e.Property(t => t.Category).HasMaxLength(100);
            e.Property(t => t.Source).HasMaxLength(20);
            e.Property(t => t.Status).HasMaxLength(20);
            e.Property(t => t.RawAiData).HasColumnType("nvarchar(max)");

            e.HasIndex(t => t.UserId);
            e.HasIndex(t => t.TransactionDate);
            e.HasIndex(t => t.MerchantName);
        });

        // ── Subscription ────────────────────────────────────────────────
        builder.Entity<Subscription>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.MonthlyCost).HasColumnType("decimal(18,2)");
            e.Property(s => s.UsageScore).HasColumnType("decimal(18,2)");
            e.Property(s => s.ServiceName).IsRequired().HasMaxLength(200);
            e.Property(s => s.Status).HasMaxLength(20);

            e.HasIndex(s => s.UserId);
        });
    }
}
