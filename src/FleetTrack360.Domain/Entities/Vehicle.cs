using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FleetTrack360.Domain.Entities
{
    public class Vehicle
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string LicensePlate { get; set; } = string.Empty;

        public string? Make { get; set; }
        public string? Model { get; set; }
        public int Year { get; set; }
        public double FuelLevel { get; set; }
        public double Mileage { get; set; }

        public ICollection<Route> Routes { get; set; } = new List<Route>();
    }
}