import React, { useState, useEffect } from 'react';
import { Truck, Navigation, AlertTriangle, TrendingUp, MapPin, Fuel, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getVehicles, getRoutes, getNotifications } from '../services/api';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, routesData, notificationsData] = await Promise.all([
          getVehicles(),
          getRoutes(),
          getNotifications()
        ]);
        setVehicles(vehiclesData);
        setRoutes(routesData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    // Refresh on page focus
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Active vehicles (vehicles with ongoing routes)
  const activeVehicles = vehicles.filter(v => {
    const vehicleRoutes = routes.filter(r => r.vehicleId === v.id);
    return vehicleRoutes.some(r => r.status === 1);
  });

  // Active routes (status = Ongoing)
  const activeRoutes = routes.filter(r => r.status === 1);

  const stats = [
    {
      name: 'Active Vehicles',
      value: activeVehicles.length,
      icon: Truck,
      color: 'bg-blue-500',
      change: '',
      changeType: 'neutral'
    },
    {
      name: 'Active Routes',
      value: activeRoutes.length,
      icon: Navigation,
      color: 'bg-green-500',
      change: '',
      changeType: 'neutral'
    },
    {
      name: 'Total Vehicles',
      value: vehicles.length,
      icon: Truck,
      color: 'bg-purple-500',
      change: '',
      changeType: 'neutral'
    },
    {
      name: 'Notifications',
      value: notifications.length,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      change: '',
      changeType: 'neutral'
    }
  ];

  // Fuel Efficiency Trend - Last 7 days from database
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    
    const dayRoutes = routes.filter(r => {
      const routeDate = new Date(r.startTime);
      routeDate.setHours(0, 0, 0, 0);
      return routeDate.getTime() === date.getTime() && r.fuelUsed > 0;
    });

    const totalDistance = dayRoutes.reduce((sum, r) => sum + r.distanceKm, 0);
    const totalFuel = dayRoutes.reduce((sum, r) => sum + r.fuelUsed, 0);
    const efficiency = totalFuel > 0 ? (totalDistance / totalFuel) : 0;

    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      efficiency: parseFloat(efficiency.toFixed(2)),
      routes: dayRoutes.length
    };
  });

  const fuelData = last7Days;

  // Vehicle distribution from real data
  const vehicleMakeMap = {};
  vehicles.forEach(vehicle => {
    const make = vehicle.make || 'Other';
    vehicleMakeMap[make] = (vehicleMakeMap[make] || 0) + 1;
  });
  
  const totalVehicles = vehicles.length;
  const vehicleData = Object.entries(vehicleMakeMap)
    .map(([name, count]) => ({
      name,
      value: totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }))
    .slice(0, 4);

  // Recent routes from real data
  const recentRoutes = routes
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 3)
    .map(route => {
      const vehicle = vehicles.find(v => v.id === route.vehicleId);
      const getStatusText = (status) => {
        switch (status) {
          case 0: return 'Not Started';
          case 1: return 'Ongoing';
          case 2: return 'Completed';
          default: return 'Unknown';
        }
      };
      return {
        id: route.id,
        vehicle: vehicle?.licensePlate || 'Unknown',
        from: route.startLocation,
        to: route.endLocation,
        distance: `${Math.round(route.distanceKm)} km`,
        status: getStatusText(route.status || 0),
        statusCode: route.status || 0
      };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">FleetTrack360 - Your comprehensive fleet management solution</p>
        </div>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              const [vehiclesData, routesData, notificationsData] = await Promise.all([
                getVehicles(),
                getRoutes(),
                getNotifications()
              ]);
              setVehicles(vehiclesData);
              setRoutes(routesData);
              setNotifications(notificationsData);
            } catch (error) {
              console.error('Error refreshing dashboard:', error);
            } finally {
              setLoading(false);
            }
          }}
          className="btn-secondary flex items-center space-x-2"
          disabled={loading}
        >
          <TrendingUp className="h-4 w-4" />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="stat-card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fuel Efficiency Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Efficiency Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fuelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'km/L', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => [`${value} km/L`, 'Efficiency']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Route Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Route Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Routes', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => [`${value} routes`, 'Count']}
              />
              <Bar dataKey="routes" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Routes */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Routes</h3>
          <div className="space-y-4">
            {recentRoutes.map((route) => (
              <div key={route.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{route.vehicle}</p>
                    <p className="text-sm text-gray-600">{route.from} → {route.to}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{route.distance}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    route.statusCode === 2 
                      ? 'bg-green-100 text-green-800' 
                      : route.statusCode === 1
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {route.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Vehicles */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Vehicles</h3>
          <div className="space-y-4">
            {activeVehicles.length > 0 ? activeVehicles.slice(0, 5).map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{vehicle.licensePlate}</p>
                    <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Fuel className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{vehicle.fuelLevel}%</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{vehicle.mileage} km</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active vehicles at the moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
