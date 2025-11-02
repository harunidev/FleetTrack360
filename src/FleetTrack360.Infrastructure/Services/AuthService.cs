using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;
using FleetTrack360.Infrastructure.Repositories;

namespace FleetTrack360.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IRepository<User> _userRepository;

        public AuthService(IRepository<User> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<string?> LoginAsync(string username, string password)
        {
            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => u.Username == username);
            if (user == null) return null;

            var hash = ComputeHash(password);
            if (user.PasswordHash != hash) return null;

            // Return dummy token
            return $"DUMMY-TOKEN-{user.Id}";
        }

        public async Task<string> RegisterAsync(string username, string password, UserRole role)
        {
            var users = await _userRepository.GetAllAsync();
            if (users.Any(u => u.Username == username))
            {
                throw new InvalidOperationException("User already exists.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                PasswordHash = ComputeHash(password),
                Role = role
            };
            await _userRepository.AddAsync(user);
            return $"DUMMY-TOKEN-{user.Id}";
        }

        private static string ComputeHash(string input)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToBase64String(bytes);
        }
    }
}