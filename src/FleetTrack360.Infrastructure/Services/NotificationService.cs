using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;
using FleetTrack360.Infrastructure.Repositories;

namespace FleetTrack360.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IRepository<Notification> _notificationRepository;

        public NotificationService(IRepository<Notification> notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            notification.Id = Guid.NewGuid();
            notification.Date = DateTime.UtcNow;
            return await _notificationRepository.AddAsync(notification);
        }

        public async Task<IEnumerable<Notification>> GetNotificationsAsync()
        {
            return await _notificationRepository.GetAllAsync();
        }
    }
}