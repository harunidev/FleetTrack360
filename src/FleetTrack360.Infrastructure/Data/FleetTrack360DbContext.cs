using Microsoft.EntityFrameworkCore;
using FleetTrack360.Domain.Entities;

namespace FleetTrack360.Infrastructure.Data
{
    public class FleetTrack360DbContext : DbContext
    {
        public FleetTrack360DbContext(DbContextOptions<FleetTrack360DbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Vehicle> Vehicles => Set<Vehicle>();
        public DbSet<Route> Routes => Set<Route>();
        public DbSet<DailyReport> DailyReports => Set<DailyReport>();
        public DbSet<Notification> Notifications => Set<Notification>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // DailyReport ile Notification arasindaki iliskiyi ignore et
            // Çünkü Notification tablosunda DailyReportId kolonu yok
            modelBuilder.Entity<DailyReport>()
                .Ignore(dr => dr.Alerts);
        }
    }
}