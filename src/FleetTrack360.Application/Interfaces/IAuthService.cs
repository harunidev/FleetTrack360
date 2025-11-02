using System.Threading.Tasks;
using FleetTrack360.Domain.Entities;

namespace FleetTrack360.Application.Interfaces
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(string username, string password, UserRole role);
        Task<string?> LoginAsync(string username, string password);
    }
}