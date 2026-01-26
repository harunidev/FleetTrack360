
# FleetTrack360

A comprehensive fleet and route management platform built with **.NET 8** and **React**, following clean architecture principles. This full-stack application implements modern web development practices with real-time data synchronization between frontend, backend, and database.

## ✨ Features

- **Clean Architecture** with separate Domain, Application, Infrastructure, and API layers
- **ASP.NET Core Web API** with RESTful endpoints for vehicles, routes, reports, and notifications
- **React Frontend** with modern UI/UX and real-time dashboard updates
- **Entity Framework Core** with SQL Server database integration
- **Real-time Data Sync** - All operations save directly to MSSQL database
- **Route Status Management** - Track routes from Not Started → Ongoing → Completed
- **Interactive Dashboards** - Fuel efficiency trends, daily route activity, and active vehicle monitoring
- **Swagger/OpenAPI** for API documentation

## 📁 Project Structure

```
FleetTrack360/
├── README.md                     # This file
├── src/
│   ├── FleetTrack360.API/        # Web API project (controllers and program entry point)
│   ├── FleetTrack360.Application/ # Application layer (interfaces for services)
│   ├── FleetTrack360.Domain/     # Domain layer (entities and enums)
│   └── FleetTrack360.Infrastructure/ # Infrastructure layer (EF Core, repositories, services)
├── frontend/                      # React frontend application
│   ├── src/
│   │   ├── pages/                # Dashboard, Vehicles, Routes, Reports, Notifications
│   │   ├── services/             # API service layer
│   │   └── components/           # Reusable UI components
│   └── package.json
└── tests/
    └── FleetTrack360.Tests/      # Unit tests
```

## 🏗️ Architecture

### Domain Layer

The **Domain** project contains core business entities:

- `User` - System users with roles (Admin or Driver)
- `Vehicle` - Tracked vehicles with fuel level, mileage, and route history
- `Route` - Journeys with status tracking (Not Started, Ongoing, Completed)
- `DailyReport` - Aggregated daily statistics
- `Notification` - Alerts for low fuel or route deviations

### Application Layer

The **Application** project defines service interfaces:

- `IAuthService` - User registration and authentication
- `IVehicleService` - CRUD operations on vehicles
- `IRouteService` - Route management and status updates
- `IReportService` - Daily report generation
- `INotificationService` - Notification retrieval and creation

### Infrastructure Layer

The **Infrastructure** project implements data access and business logic:

- `FleetTrack360DbContext` - EF Core database context
- `Repository<T>` - Generic repository for common CRUD operations
- Service implementations for all application interfaces
- `DependencyInjection` - DI container configuration

### API Layer

The **API** project exposes REST endpoints:

- `AuthController` - `/api/auth/register`, `/api/auth/login`
- `VehiclesController` - `/api/vehicles` - Full CRUD operations
- `RoutesController` - `/api/routes` - Route creation and status management
- `ReportsController` - `/api/reports/daily` - Daily report generation
- `NotificationsController` - `/api/notifications` - Notification management

### Frontend Layer

The **React** frontend provides:

- **Dashboard** - Overview with active vehicles, route statistics, and interactive charts
- **Vehicles Management** - Add, edit, delete, and monitor vehicles
- **Routes Management** - Create routes and update status (Not Started → Ongoing → Completed)
- **Reports** - Analytics and insights with data visualization
- **Notifications** - Real-time alerts and notifications

## 🛠️ Prerequisites

- **.NET 8 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **SQL Server** (Local or Express edition) - [Download here](https://www.microsoft.com/sql-server/sql-server-downloads)
- **npm** or **yarn** - Comes with Node.js

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/FleetTrack360.git
cd FleetTrack360
```

### 2. Database Setup

1. Open **SQL Server Management Studio** (SSMS)

2. Connect to your SQL Server instance (e.g., `localhost\SQLEXPRESS`)

3. Create a new database:
   ```sql
   CREATE DATABASE fleettrack360;
   ```

4. Create the required tables:
   ```sql
   USE [fleettrack360];
   GO

   -- Users Table
   CREATE TABLE [dbo].[Users] (
       [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
       [Username] NVARCHAR(255) NOT NULL,
       [PasswordHash] NVARCHAR(MAX) NOT NULL,
       [Role] INT NOT NULL DEFAULT 1
   );
   GO

   -- Vehicles Table
   CREATE TABLE [dbo].[Vehicles] (
       [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
       [LicensePlate] NVARCHAR(50) NOT NULL,
       [Make] NVARCHAR(100) NULL,
       [Model] NVARCHAR(100) NULL,
       [Year] INT NOT NULL,
       [FuelLevel] FLOAT NOT NULL DEFAULT 0,
       [Mileage] FLOAT NOT NULL DEFAULT 0
   );
   GO

   -- Routes Table
   CREATE TABLE [dbo].[Routes] (
       [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
       [VehicleId] UNIQUEIDENTIFIER NOT NULL,
       [StartLocation] NVARCHAR(255) NOT NULL,
       [EndLocation] NVARCHAR(255) NOT NULL,
       [StartTime] DATETIME2 NOT NULL,
       [EndTime] DATETIME2 NOT NULL,
       [DistanceKm] FLOAT NOT NULL,
       [FuelUsed] FLOAT NOT NULL,
       [Status] INT NOT NULL DEFAULT 0,
       CONSTRAINT [FK_Routes_Vehicles_VehicleId] FOREIGN KEY ([VehicleId]) 
           REFERENCES [dbo].[Vehicles] ([Id]) ON DELETE CASCADE
   );
   GO

   -- Notifications Table
   CREATE TABLE [dbo].[Notifications] (
       [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
       [VehicleId] UNIQUEIDENTIFIER NOT NULL,
       [Type] INT NOT NULL,
       [Message] NVARCHAR(MAX) NOT NULL,
       [Date] DATETIME2 NOT NULL,
       CONSTRAINT [FK_Notifications_Vehicles_VehicleId] FOREIGN KEY ([VehicleId]) 
           REFERENCES [dbo].[Vehicles] ([Id]) ON DELETE CASCADE
   );
   GO

   -- DailyReports Table
   CREATE TABLE [dbo].[DailyReports] (
       [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
       [Date] DATETIME2 NOT NULL,
       [TotalVehicles] INT NOT NULL,
       [AvgFuelConsumption] FLOAT NOT NULL,
       [TotalDistanceKm] FLOAT NOT NULL
   );
   GO

   -- Create Indexes for better performance
   CREATE INDEX [IX_Routes_VehicleId] ON [dbo].[Routes]([VehicleId]);
   CREATE INDEX [IX_Routes_StartTime] ON [dbo].[Routes]([StartTime]);
   CREATE INDEX [IX_Routes_Status] ON [dbo].[Routes]([Status]);
   CREATE INDEX [IX_Notifications_VehicleId] ON [dbo].[Notifications]([VehicleId]);
   CREATE INDEX [IX_Notifications_Date] ON [dbo].[Notifications]([Date]);
   GO
   ```

   **Note:** Alternatively, the application will automatically create tables on first run using Entity Framework Core's `EnsureCreated()` method. However, manually creating tables gives you more control over the database structure.

### 3. Configure Backend

1. Navigate to the API project:
   ```bash
   cd src/FleetTrack360.API
   ```

2. Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=fleettrack360;Integrated Security=true;TrustServerCertificate=true;"
     }
   }
   ```

3. Restore dependencies and build:
   ```bash
   dotnet restore
   dotnet build
   ```

### 4. Configure Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### 5. Run the Application

**Option 1: Manual Start (Recommended for Development)**

1. Start the backend:
   ```bash
   cd src/FleetTrack360.API
   dotnet run
   ```
   Backend will run on `http://localhost:5000`

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on `http://localhost:3000`

**Option 2: Automatic Start**

The backend automatically launches the frontend when it starts. Simply run:
```bash
cd src/FleetTrack360.API
dotnet run
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger

## 📊 Features Overview

### Dashboard
- Real-time statistics (Active Vehicles, Active Routes, Total Vehicles, Notifications)
- Fuel Efficiency Trend Chart (last 7 days from database)
- Daily Route Activity Chart
- Active vehicles monitoring
- Recent routes overview

### Vehicles Management
- Add, edit, and delete vehicles
- Track fuel levels and mileage
- View vehicle route history
- Real-time database synchronization

### Routes Management
- Create routes with start/end locations
- Track route status:
  - **Not Started** (0) - Route created but not begun
  - **Ongoing** (1) - Route currently in progress
  - **Completed** (2) - Route finished
- Update route status with save confirmation
- View route details (distance, fuel used, efficiency)

### Reports & Analytics
- Fuel efficiency analytics
- Vehicle usage statistics
- Monthly performance reports
- Data visualization with charts

## 🔧 Technology Stack

### Backend
- **.NET 8** - Framework
- **ASP.NET Core Web API** - RESTful API
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **Swagger/OpenAPI** - API Documentation

### Frontend
- **React** - UI Framework
- **Recharts** - Data Visualization
- **Lucide React** - Icons
- **Axios** - HTTP Client
- **React Router** - Navigation

## 📝 Database Schema

### Tables
- `Users` - System users
- `Vehicles` - Fleet vehicles
- `Routes` - Vehicle routes with status tracking
- `Notifications` - System notifications
- `DailyReports` - Aggregated daily reports

### Route Status Values
- `0` = Not Started
- `1` = Ongoing
- `2` = Completed

## 🧪 Testing

Run unit tests:
```bash
dotnet test
```

## 📄 Notes

- The application uses **Windows Authentication** by default for SQL Server. Update the connection string if using SQL Server Authentication.
- All data operations are **real-time** and directly interact with the database - no mock data or caching.
- The frontend automatically refreshes every 30 seconds and on window focus.
- Route status changes require a "Save" button click to persist to the database.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## license

This project is provided as-is.

## 👤 Author

harunidev - [GitHub](https://github.com/harunidev)

---

**Note**: This application is designed for local development and may require additional configuration for production deployment.
