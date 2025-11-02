using System;
using System.Threading.Tasks;
using FleetTrack360.Domain.Entities;

namespace FleetTrack360.Application.Interfaces
{
    public interface IReportService
    {
        Task<DailyReport> GenerateDailyReportAsync(DateTime date);
    }
}