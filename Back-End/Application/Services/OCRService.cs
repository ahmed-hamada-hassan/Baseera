using Baseera.Api.Application.DTOs;
using Baseera.Api.Application.Interfaces;
using System.Globalization;

namespace Baseera.Api.Application.Services;

/// <summary>
/// Processes OCR/AI-extracted bill data (Demo Mock implementation).
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
        // Simulate processing time
        await Task.Delay(800);

        var transactionDate = DateTime.ParseExact(
    "25-05-2024 2:30",
    "dd-MM-yyyy H:mm",
    CultureInfo.InvariantCulture
);

        _logger.LogInformation("Processing image with mock OCR engine...");

        var jsonResult = "{\n  \"Amount\": 42.50,\n  \"MerchantName\": \"Coffee Shop (Mock)\",\n  \"Category\": \"Food & Dining\"\n}";

        return new OcrResultDto
        {
            Amount = 42.50m,
            MerchantName = "Coffee Shop (Mock)",
            Category = "Food & Dining",
            TransactionDate = transactionDate,
            RawAiData = jsonResult
        };
    }
}
