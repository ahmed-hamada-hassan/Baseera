using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Entities;
using Baseera.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Baseera.Api.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _context;

    public TransactionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Transaction>> GetByUserIdAsync(string userId, int page = 1, int pageSize = 50)
    {
        return await _context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.TransactionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Transaction?> GetByIdAsync(string id)
    {
        return await _context.Transactions.FindAsync(id);
    }

    public async Task AddAsync(Transaction transaction)
    {
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<Transaction> transactions)
    {
        _context.Transactions.AddRange(transactions);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Transaction transaction)
    {
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Transaction>> GetByUserIdAndDateRangeAsync(string userId, DateTime from, DateTime to)
    {
        return await _context.Transactions
            .Where(t => t.UserId == userId && t.TransactionDate >= from && t.TransactionDate <= to)
            .OrderByDescending(t => t.TransactionDate)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<decimal> GetTotalSpendAsync(string userId, DateTime from, DateTime to)
    {
        return await _context.Transactions
            .Where(t => t.UserId == userId && t.TransactionDate >= from && t.TransactionDate <= to)
            .SumAsync(t => t.Amount);
    }
}
