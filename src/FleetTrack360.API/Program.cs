using FleetTrack360.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Servisleri ekle - SQLite kullan (development için)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "SQLite";
builder.Services.AddInfrastructure(connectionString);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? "FleetTrack360DefaultDevSecret!";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.FromMinutes(5)
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Ensure database is created and seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FleetTrack360.Infrastructure.Data.FleetTrack360DbContext>();
    context.Database.EnsureCreated();
    
    // Seed dummy data if database is empty
    if (!context.Vehicles.Any())
    {
        var vehicles = new[]
        {
            new FleetTrack360.Domain.Entities.Vehicle
            {
                Id = Guid.NewGuid(),
                LicensePlate = "34ABC123",
                Make = "Mercedes",
                Model = "Sprinter",
                Year = 2022,
                FuelLevel = 75.5,
                Mileage = 45230
            },
            new FleetTrack360.Domain.Entities.Vehicle
            {
                Id = Guid.NewGuid(),
                LicensePlate = "06XYZ789",
                Make = "Ford",
                Model = "Transit",
                Year = 2023,
                FuelLevel = 45.2,
                Mileage = 28150
            },
            new FleetTrack360.Domain.Entities.Vehicle
            {
                Id = Guid.NewGuid(),
                LicensePlate = "35DEF456",
                Make = "Volkswagen",
                Model = "Crafter",
                Year = 2021,
                FuelLevel = 18.5,
                Mileage = 67890
            },
            new FleetTrack360.Domain.Entities.Vehicle
            {
                Id = Guid.NewGuid(),
                LicensePlate = "07GHI012",
                Make = "Iveco",
                Model = "Daily",
                Year = 2022,
                FuelLevel = 92.0,
                Mileage = 32100
            },
            new FleetTrack360.Domain.Entities.Vehicle
            {
                Id = Guid.NewGuid(),
                LicensePlate = "34JKL345",
                Make = "Renault",
                Model = "Master",
                Year = 2023,
                FuelLevel = 60.8,
                Mileage = 18900
            }
        };
        
        context.Vehicles.AddRange(vehicles);
        context.SaveChanges();
        
        // Seed routes
        var now = DateTime.Now;
        var routes = new List<FleetTrack360.Domain.Entities.Route>();
        
        foreach (var vehicle in vehicles)
        {
            // Completed routes (last 7 days)
            for (int i = 0; i < 5; i++)
            {
                var startTime = now.AddDays(-(6 - i)).AddHours(8 + i);
                var endTime = startTime.AddHours(2 + (i * 0.5));
                var distance = 120 + (i * 25) + new Random().Next(10, 50);
                var fuelUsed = distance / (12.5 + new Random().NextDouble() * 2);
                
                routes.Add(new FleetTrack360.Domain.Entities.Route
                {
                    Id = Guid.NewGuid(),
                    VehicleId = vehicle.Id,
                    StartLocation = new[] { "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya" }[i % 5],
                    EndLocation = new[] { "Ankara", "İzmir", "Bursa", "Antalya", "İstanbul" }[(i + 1) % 5],
                    StartTime = startTime,
                    EndTime = endTime,
                    DistanceKm = distance,
                    FuelUsed = Math.Round(fuelUsed, 1),
                    Status = FleetTrack360.Domain.Entities.RouteStatus.Completed
                });
            }
            
            // Ongoing route (today)
            routes.Add(new FleetTrack360.Domain.Entities.Route
            {
                Id = Guid.NewGuid(),
                VehicleId = vehicle.Id,
                StartLocation = "İstanbul",
                EndLocation = "Ankara",
                StartTime = now.AddHours(-2),
                EndTime = now.AddHours(4),
                DistanceKm = 450,
                FuelUsed = 0,
                Status = FleetTrack360.Domain.Entities.RouteStatus.Ongoing
            });
            
            // Not started route (future)
            routes.Add(new FleetTrack360.Domain.Entities.Route
            {
                Id = Guid.NewGuid(),
                VehicleId = vehicle.Id,
                StartLocation = "Ankara",
                EndLocation = "İzmir",
                StartTime = now.AddDays(1).AddHours(9),
                EndTime = now.AddDays(1).AddHours(15),
                DistanceKm = 560,
                FuelUsed = 0,
                Status = FleetTrack360.Domain.Entities.RouteStatus.NotStarted
            });
        }
        
        context.Routes.AddRange(routes);
        context.SaveChanges();
        
        // Seed notifications
        var notifications = new[]
        {
            new FleetTrack360.Domain.Entities.Notification
            {
                Id = Guid.NewGuid(),
                VehicleId = vehicles[2].Id, // Low fuel vehicle
                Type = FleetTrack360.Domain.Entities.NotificationType.LowFuel,
                Message = "Yakıt seviyesi kritik seviyede (18.5%)",
                Date = now.AddHours(-2)
            },
            new FleetTrack360.Domain.Entities.Notification
            {
                Id = Guid.NewGuid(),
                VehicleId = vehicles[1].Id,
                Type = FleetTrack360.Domain.Entities.NotificationType.LowFuel,
                Message = "Yakıt seviyesi düşük (45.2%)",
                Date = now.AddHours(-5)
            },
            new FleetTrack360.Domain.Entities.Notification
            {
                Id = Guid.NewGuid(),
                VehicleId = vehicles[0].Id,
                Type = FleetTrack360.Domain.Entities.NotificationType.RouteDeviation,
                Message = "Rota sapması tespit edildi",
                Date = now.AddDays(-1)
            }
        };
        
        context.Notifications.AddRange(notifications);
        context.SaveChanges();
        
        Console.WriteLine("Dummy data seeded successfully!");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS (HTTPS redirection'dan önce olmalı)
app.UseCors("AllowAll");

// Routing middleware ekle
app.UseRouting();

// HTTPS redirection'ı kaldırdık çünkü sadece HTTP kullanıyoruz
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Frontend'i otomatik başlat (backend başladıktan sonra)
_ = Task.Run(async () =>
{
    await Task.Delay(2000); // Backend'in tamamen başlaması için 2 saniye bekle
    
    var currentDir = Directory.GetCurrentDirectory();
    var projectRoot = Path.GetFullPath(Path.Combine(currentDir, "..", "..", "..", ".."));
    var frontendPath = Path.Combine(projectRoot, "frontend");
    
    if (Directory.Exists(frontendPath))
    {
        try
        {
            var packageJsonPath = Path.Combine(frontendPath, "package.json");
            if (File.Exists(packageJsonPath))
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = $"/c cd /d \"{frontendPath}\" && start cmd /k npm start",
                        UseShellExecute = true,
                        CreateNoWindow = true
                    });
                }
                else
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = "/bin/bash",
                        Arguments = $"-c \"cd '{frontendPath}' && npm start &\"",
                        UseShellExecute = true,
                        CreateNoWindow = true
                    });
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Frontend başlatılamadı: {ex.Message}");
        }
    }
});

app.Run("http://localhost:5000");