using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Infrastructure.Data;
using FleetTrack360.Infrastructure.Repositories;
using FleetTrack360.Infrastructure.Services;

namespace FleetTrack360.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<FleetTrack360DbContext>(options =>
                options.UseSqlServer(connectionString));

            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IVehicleService, VehicleService>();
            services.AddScoped<IRouteService, RouteService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<INotificationService, NotificationService>();

            return services;
        }
    }
}