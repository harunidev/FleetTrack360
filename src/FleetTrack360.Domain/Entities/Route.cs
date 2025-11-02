using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FleetTrack360.Domain.Entities
{
    public enum RouteStatus
    {
        NotStarted = 0,
        Ongoing = 1,
        Completed = 2
    }

    public class Route
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid VehicleId { get; set; }

        [ForeignKey(nameof(VehicleId))]
        public Vehicle? Vehicle { get; set; }

        public string StartLocation { get; set; } = string.Empty;
        public string EndLocation { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public double DistanceKm { get; set; }
        public double FuelUsed { get; set; }
        public RouteStatus Status { get; set; } = RouteStatus.NotStarted;
    }
}