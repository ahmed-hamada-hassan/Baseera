using Baseera.Api.Application.DTOs;

namespace Baseera.Api.Application.Interfaces;

public interface IOCRService
{
    /// <summary>
    /// Processes AI-extracted bill data and saves as a Pending transaction.
    /// </summary>
    Task<TransactionDto> ProcessOcrResultAsync(Guid userId, OcrResultDto ocrResult);
}
