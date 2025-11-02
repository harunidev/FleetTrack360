using FleetTrack360.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Diagnostics;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

// Servisleri ekle
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
    "Server=localhost;Database=FleetTrack360Db;User Id=sa;Password=Your_password123;TrustServerCertificate=true;";
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

// JWT Authentication placeholder
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = false,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecretKey"))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FleetTrack360.Infrastructure.Data.FleetTrack360DbContext>();
    context.Database.EnsureCreated();
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