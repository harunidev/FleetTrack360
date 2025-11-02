using System;
using System.Linq;
using System.Threading.Tasks;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;
using FleetTrack360.Infrastructure.Repositories;

namespace FleetTrack360.Infrastructure.Services
{
    public class ReportService : IReportService
    {
        private readonly IRepository<Vehicle> _vehicleRepository;
        private readonly IRepository<Route> _routeRepository;
        private readonly IRepository<Notification> _notificationRepository;

        public ReportService(IRepository<Vehicle> vehicleRepository, IRepository<Route> routeRepository, IRepository<Notification> notificationRepository)
        {
            _vehicleRepository = vehicleRepository;
            _routeRepository = routeRepository;
            _notificationRepository = notificationRepository;
        }

        public async Task<DailyReport> GenerateDailyReportAsync(DateTime date)
        {
            var vehicles = await _vehicleRepository.GetAllAsync();
            var routes = (await _routeRepository.GetAllAsync()).Where(r => r.StartTime.Date == date.Date);
            var notifications = (await _notificationRepository.GetAllAsync()).Where(n => n.Date.Date == date.Date);

            var totalVehicles = vehicles.Count();
            var totalDistance = routes.Sum(r => r.DistanceKm);
            var avgFuel = routes.Any() ? routes.Average(r => r.FuelUsed) : 0;

            var report = new DailyReport
            {
                Id = Guid.NewGuid(),
                Date = date,
                TotalVehicles = totalVehicles,
                TotalDistanceKm = totalDistance,
                AvgFuelConsumption = avgFuel,
                Alerts = notifications.ToList()
            };

            return report;
        }
    }
}