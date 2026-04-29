using Baseera.Api.Domain.Entities;

namespace Baseera.Api.Application.Interfaces;

public interface ISubscriptionRepository
{
    Task<IEnumerable<Subscription>> GetByUserIdAsync(Guid userId);
    Task<Subscription?> GetByIdAsync(Guid id);
    Task<Subscription?> GetByServiceNameAsync(Guid userId, string serviceName);
    Task AddAsync(Subscription subscription);
    Task UpdateAsync(Subscription subscription);
    Task<IEnumerable<Subscription>> GetAtRiskAsync(Guid userId);
}
