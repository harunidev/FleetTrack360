using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FleetTrack360.Domain.Entities
{
    public class DailyReport
    {
        [Key]
        public Guid Id { get; set; }

        public DateTime Date { get; set; }
        public int TotalVehicles { get; set; }
        public double AvgFuelConsumption { get; set; }
        public double TotalDistanceKm { get; set; }

        public ICollection<Notification> Alerts { get; set; } = new List<Notification>();
    }
}