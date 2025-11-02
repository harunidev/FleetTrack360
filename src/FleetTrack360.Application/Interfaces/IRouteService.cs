using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FleetTrack360.Domain.Entities;

namespace FleetTrack360.Application.Interfaces
{
    public interface IRouteService
    {
        Task<IEnumerable<Route>> GetAllRoutesAsync();
        Task<IEnumerable<Route>> GetRoutesForVehicleAsync(Guid vehicleId);
        Task<Route> CreateRouteAsync(Route route);
        Task UpdateRouteAsync(Route route);
        Task<Route?> GetRouteByIdAsync(Guid id);
    }
}