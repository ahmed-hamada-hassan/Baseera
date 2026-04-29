using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Entities;
using Baseera.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Baseera.Api.Infrastructure.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly AppDbContext _context;

    public SubscriptionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Subscription>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Subscriptions
            .Where(s => s.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Subscription?> GetByIdAsync(Guid id)
    {
        return await _context.Subscriptions.FindAsync(id);
    }

    public async Task<Subscription?> GetByServiceNameAsync(Guid userId, string serviceName)
    {
        var normalized = serviceName.Trim().ToLowerInvariant();
        return await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId &&
                s.ServiceName.ToLower().Contains(normalized));
    }

    public async Task AddAsync(Subscription subscription)
    {
        _context.Subscriptions.Add(subscription);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Subscription subscription)
    {
        _context.Subscriptions.Update(subscription);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Subscription>> GetAtRiskAsync(Guid userId)
    {
        return await _context.Subscriptions
            .Where(s => s.UserId == userId && s.Status == "AtRisk")
            .AsNoTracking()
            .ToListAsync();
    }
}
