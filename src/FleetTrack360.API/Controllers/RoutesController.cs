using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;
using System;

namespace FleetTrack360.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoutesController : ControllerBase
    {
        private readonly IRouteService _routeService;

        public RoutesController(IRouteService routeService)
        {
            _routeService = routeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var routes = await _routeService.GetAllRoutesAsync();
            return Ok(routes);
        }

        [HttpGet("vehicle/{vehicleId}")]
        public async Task<IActionResult> GetForVehicle(Guid vehicleId)
        {
            var routes = await _routeService.GetRoutesForVehicleAsync(vehicleId);
            return Ok(routes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var route = await _routeService.GetRouteByIdAsync(id);
            return route == null ? NotFound() : Ok(route);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FleetTrack360.Domain.Entities.Route route)
        {
            try
            {
                if (route == null)
                {
                    return BadRequest("Route information cannot be empty.");
                }

                // Status defaults to NotStarted
                route.Status = FleetTrack360.Domain.Entities.RouteStatus.NotStarted;

                var created = await _routeService.CreateRouteAsync(route);
                return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the route.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] FleetTrack360.Domain.Entities.Route route)
        {
            try
            {
                if (id != route.Id)
                {
                    return BadRequest("Route ID does not match.");
                }

                await _routeService.UpdateRouteAsync(route);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the route.", error = ex.Message });
            }
        }
    }
}