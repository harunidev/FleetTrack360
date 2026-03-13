using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;
using System;
using Microsoft.Extensions.Logging;

namespace FleetTrack360.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;
        private readonly ILogger<VehiclesController> _logger;

        public VehiclesController(IVehicleService vehicleService, ILogger<VehiclesController> logger)
        {
            _vehicleService = vehicleService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vehicles = await _vehicleService.GetAllVehiclesAsync();
            return Ok(vehicles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var vehicle = await _vehicleService.GetVehicleByIdAsync(id);
            return vehicle == null ? NotFound() : Ok(vehicle);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Vehicle vehicle)
        {
            try
            {
                _logger.LogInformation("Vehicle creation request received. Data: {@Vehicle}", vehicle);

                if (vehicle == null)
                {
                    _logger.LogWarning("Vehicle information is null.");
                    return BadRequest("Vehicle information cannot be empty.");
                }

                if (string.IsNullOrWhiteSpace(vehicle.LicensePlate))
                    return BadRequest("Plaka boş olamaz.");

                if (string.IsNullOrWhiteSpace(vehicle.Make) || string.IsNullOrWhiteSpace(vehicle.Model))
                    return BadRequest("Marka ve model boş olamaz.");

                if (vehicle.Year < 1900 || vehicle.Year > DateTime.Now.Year + 1)
                    return BadRequest("Geçersiz araç yılı.");

                if (vehicle.FuelLevel < 0 || vehicle.FuelLevel > 100)
                    return BadRequest("Yakıt seviyesi 0-100 arasında olmalıdır.");

                if (vehicle.Mileage < 0)
                    return BadRequest("Kilometre negatif olamaz.");

                // Reset ID (backend will generate new ID for new record)
                vehicle.Id = Guid.Empty;
                // Clear navigation property
                vehicle.Routes = new List<FleetTrack360.Domain.Entities.Route>();

                _logger.LogInformation("Saving vehicle: LicensePlate={LicensePlate}, Make={Make}, Model={Model}", 
                    vehicle.LicensePlate, vehicle.Make, vehicle.Model);

                var created = await _vehicleService.CreateVehicleAsync(vehicle);

                _logger.LogInformation("Vehicle successfully created. ID={Id}", created.Id);
                
                return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating vehicle: {Message}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while creating the vehicle.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Vehicle vehicle)
        {
            if (id != vehicle.Id) return BadRequest();

            await _vehicleService.UpdateVehicleAsync(vehicle);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _vehicleService.DeleteVehicleAsync(id);
            return NoContent();
        }
    }
}