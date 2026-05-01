using Baseera.Api.Domain.Entities;

namespace Baseera.Api.Application.Interfaces;

public interface IAccountRepository
{
    Task<IEnumerable<Account>> GetByUserIdAsync(string userId);
    Task<Account?> GetByIdAsync(string id);
    Task AddAsync(Account account);
    Task UpdateAsync(Account account);
}
