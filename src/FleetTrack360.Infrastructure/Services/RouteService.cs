using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;
using FleetTrack360.Infrastructure.Repositories;

namespace FleetTrack360.Infrastructure.Services
{
    public class RouteService : IRouteService
    {
        private readonly IRepository<Route> _routeRepository;

        public RouteService(IRepository<Route> routeRepository)
        {
            _routeRepository = routeRepository;
        }

        public async Task<IEnumerable<Route>> GetAllRoutesAsync()
        {
            return await _routeRepository.GetAllAsync();
        }

        public async Task<Route> CreateRouteAsync(Route route)
        {
            route.Id = Guid.NewGuid();
            return await _routeRepository.AddAsync(route);
        }

        public async Task<IEnumerable<Route>> GetRoutesForVehicleAsync(Guid vehicleId)
        {
            var routes = await _routeRepository.GetAllAsync();
            return routes.Where(r => r.VehicleId == vehicleId);
        }

        public async Task UpdateRouteAsync(Route route)
        {
            await _routeRepository.UpdateAsync(route);
        }

        public async Task<Route?> GetRouteByIdAsync(Guid id)
        {
            return await _routeRepository.GetByIdAsync(id);
        }
    }
}