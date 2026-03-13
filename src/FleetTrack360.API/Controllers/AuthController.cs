using Microsoft.AspNetCore.Mvc;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;

namespace FleetTrack360.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Length < 3)
                return BadRequest("Kullanıcı adı en az 3 karakter olmalıdır.");

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
                return BadRequest("Şifre en az 6 karakter olmalıdır.");

            try
            {
                var token = await _authService.RegisterAsync(request.Username, request.Password, request.Role);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Kullanıcı adı ve şifre boş olamaz.");

            var token = await _authService.LoginAsync(request.Username, request.Password);
            if (token == null) return Unauthorized();

            return Ok(new { Token = token });
        }

        public record RegisterRequest(string Username, string Password, UserRole Role);
        public record LoginRequest(string Username, string Password);
    }
}