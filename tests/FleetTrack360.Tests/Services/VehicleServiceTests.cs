using Xunit;
using Moq;
using System;
using System.Threading.Tasks;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;
using FleetTrack360.Infrastructure.Services;
using FleetTrack360.Infrastructure.Repositories;

namespace FleetTrack360.Tests.Services
{
    public class VehicleServiceTests
    {
        [Fact]
        public async Task CreateVehicle_ShouldAssignId()
        {
            // Arrange
            var repoMock = new Mock<IRepository<Vehicle>>();
            repoMock.Setup(r => r.AddAsync(It.IsAny<Vehicle>())).ReturnsAsync((Vehicle v) => v);
            var service = new VehicleService(repoMock.Object);
            var vehicle = new Vehicle { LicensePlate = "34ABC123" };

            // Act
            var result = await service.CreateVehicleAsync(vehicle);

            // Assert
            Assert.NotEqual(Guid.Empty, result.Id);
        }
    }
}