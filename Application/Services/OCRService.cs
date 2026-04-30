using Baseera.Api.Application.DTOs;
using Baseera.Api.Application.Interfaces;
using Baseera.Api.Domain.Entities;
using Baseera.Api.Domain.Enums;

namespace Baseera.Api.Application.Services;

/// <summary>
/// Processes OCR/AI-extracted bill data.
/// </summary>
public class OCRService : IOCRService
{
    private readonly ILogger<OCRService> _logger;

    public OCRService(ILogger<OCRService> logger)
    {
        _logger = logger;
    }

    public async Task<OcrResultDto> ProcessImageAsync(Stream imageStream)
    {
        // Mock AI processing: In a real scenario, this would send the stream to Google Cloud Vision, Gemini, etc.
        await Task.Delay(500); // Simulate network call

        var jsonResult = "{\n  \"Amount\": 42.50,\n  \"MerchantName\": \"Coffee Shop\",\n  \"Category\": \"Food & Dining\"\n}";

        _logger.LogInformation("Image processed successfully.");

        return new OcrResultDto
        {
            Amount = 42.50m,
            MerchantName = "Coffee Shop",
            Category = "Food & Dining",
            TransactionDate = DateTime.UtcNow,
            RawAiData = jsonResult
        };
    }
}
