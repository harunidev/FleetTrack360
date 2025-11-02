using Microsoft.AspNetCore.Mvc;
using FleetTrack360.Application.Interfaces;
using FleetTrack360.Domain.Entities;

namespace FleetTrack360.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var notifications = await _notificationService.GetNotificationsAsync();
            return Ok(notifications);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Notification notification)
        {
            var created = await _notificationService.CreateNotificationAsync(notification);
            return Ok(created);
        }
    }
}