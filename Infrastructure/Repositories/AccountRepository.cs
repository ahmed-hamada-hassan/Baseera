using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Baseera.Api.Infrastructure.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly Data.AppDbContext _context;

    public AccountRepository(Data.AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Account>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Accounts
            .Where(a => a.UserId == userId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Account?> GetByIdAsync(Guid id)
    {
        return await _context.Accounts.FindAsync(id);
    }

    public async Task AddAsync(Account account)
    {
        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Account account)
    {
        _context.Accounts.Update(account);
        await _context.SaveChangesAsync();
    }
}
