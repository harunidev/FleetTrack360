using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;
using FleetTrack360.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FleetTrack360.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IRepository<User> userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<string?> LoginAsync(string username, string password)
        {
            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => u.Username == username);
            if (user == null) return null;

            var hash = ComputeHash(password, user.PasswordSalt);
            if (user.PasswordHash != hash) return null;

            return GenerateJwtToken(user);
        }

        public async Task<string> RegisterAsync(string username, string password, UserRole role)
        {
            var users = await _userRepository.GetAllAsync();
            if (users.Any(u => u.Username == username))
            {
                throw new InvalidOperationException("User already exists.");
            }

            var salt = GenerateSalt();
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                PasswordSalt = salt,
                PasswordHash = ComputeHash(password, salt),
                Role = role
            };
            await _userRepository.AddAsync(user);
            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSecret = _configuration["Jwt:Secret"]
                ?? Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? "FleetTrack360DefaultDevSecret!";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateSalt()
        {
            var saltBytes = new byte[16];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(saltBytes);
            return Convert.ToBase64String(saltBytes);
        }

        private static string ComputeHash(string input, string salt)
        {
            using var pbkdf2 = new Rfc2898DeriveBytes(
                Encoding.UTF8.GetBytes(input),
                Convert.FromBase64String(salt),
                100_000,
                HashAlgorithmName.SHA256);
            return Convert.ToBase64String(pbkdf2.GetBytes(32));
        }
    }
}