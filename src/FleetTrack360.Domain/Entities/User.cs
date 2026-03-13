using System;
using System.ComponentModel.DataAnnotations;

namespace FleetTrack360.Domain.Entities
{
    public enum UserRole
    {
        Admin,
        Driver
    }

    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string PasswordSalt { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; } = UserRole.Driver;
    }
}