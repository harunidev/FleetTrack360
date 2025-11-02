using Microsoft.AspNetCore.Mvc;
using FleetTrack360.Application.Interfaces;

namespace FleetTrack360.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("daily")]
        public async Task<IActionResult> GetDaily([FromQuery] DateTime? date)
        {
            var reportDate = date ?? DateTime.UtcNow.Date;
            var report = await _reportService.GenerateDailyReportAsync(reportDate);
            return Ok(report);
        }
    }
}