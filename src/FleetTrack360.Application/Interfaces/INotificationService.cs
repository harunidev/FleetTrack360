using System.Collections.Generic;
using System.Threading.Tasks;
using FleetTrack360.Domain.Entities;

namespace FleetTrack360.Application.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<Notification>> GetNotificationsAsync();
        Task<Notification> CreateNotificationAsync(Notification notification);
    }
}