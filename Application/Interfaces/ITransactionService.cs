using Baseera.Api.Application.DTOs;
using Baseera.Api.Domain.Entities;

namespace Baseera.Api.Application.Interfaces;

public interface ITransactionService
{
    Task<TransactionDto> AddManualTransactionAsync(string userId, ManualTransactionDto dto);
}
