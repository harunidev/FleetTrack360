using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FleetTrack360.Domain.Entities
{
    public enum NotificationType
    {
        LowFuel,
        RouteDeviation
    }

    public class Notification
    {
        [Key]
        public Guid Id { get; set; }

        public Guid VehicleId { get; set; }

        [ForeignKey(nameof(VehicleId))]
        public Vehicle? Vehicle { get; set; }

        public NotificationType Type { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }
}