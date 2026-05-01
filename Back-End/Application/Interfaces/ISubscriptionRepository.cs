using Baseera.Api.Domain.Entities;

namespace Baseera.Api.Application.Interfaces;

public interface ISubscriptionRepository
{
    Task<IEnumerable<Subscription>> GetByUserIdAsync(string userId);
    Task<Subscription?> GetByIdAsync(string id);
    Task<Subscription?> GetByServiceNameAsync(string userId, string serviceName);
    Task AddAsync(Subscription subscription);
    Task UpdateAsync(Subscription subscription);
    Task<IEnumerable<Subscription>> GetAtRiskAsync(string userId);
}
