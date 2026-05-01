using Baseera.Api.Application.DTOs;

namespace Baseera.Api.Application.Interfaces;

public interface IOCRService
{
    /// <summary>
    /// Processes an image stream using AI and extracts bill data.
    /// </summary>
    Task<OcrResultDto> ProcessImageAsync(Stream imageStream);
}
