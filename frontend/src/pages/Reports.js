import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Fuel, MapPin, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getVehicles, getRoutes } from '../services/api';

const Reports = () => {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const [vehiclesData, routesData] = await Promise.all([
        getVehicles(),
        getRoutes()
      ]);
      setVehicles(vehiclesData);
      setRoutes(routesData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gerçek verilerden grafik verileri oluştur
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayRoutes = routes.filter(r => {
      const routeDate = new Date(r.startTime);
      return routeDate.toDateString() === date.toDateString();
    });
    const totalFuel = dayRoutes.reduce((sum, r) => sum + r.fuelUsed, 0);
    const totalDistance = dayRoutes.reduce((sum, r) => sum + r.distanceKm, 0);
    const efficiency = totalFuel > 0 ? (totalDistance / totalFuel) : 0;
    return {
      name: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
      efficiency: parseFloat(efficiency.toFixed(1))
    };
  });

  const fuelEfficiencyData = last7Days;

  // Vehicle usage data from real data
  const vehicleUsageMap = {};
  vehicles.forEach(vehicle => {
    const vehicleRoutes = routes.filter(r => r.vehicleId === vehicle.id);
    const totalDistance = vehicleRoutes.reduce((sum, r) => sum + r.distanceKm, 0);
    if (totalDistance > 0) {
      vehicleUsageMap[vehicle.make || 'Other'] = (vehicleUsageMap[vehicle.make || 'Other'] || 0) + totalDistance;
    }
  });
  
  const totalVehicleDistance = Object.values(vehicleUsageMap).reduce((sum, val) => sum + val, 0);
  const vehicleUsageData = Object.entries(vehicleUsageMap)
    .map(([name, distance]) => ({
      name,
      usage: totalVehicleDistance > 0 ? Math.round((distance / totalVehicleDistance) * 100) : 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }))
    .slice(0, 4);

  // Son 6 ayın verilerini oluştur
  const monthlyStats = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthRoutes = routes.filter(r => {
      const routeDate = new Date(r.startTime);
      return routeDate.getMonth() === date.getMonth() && routeDate.getFullYear() === date.getFullYear();
    });
    const distance = monthRoutes.reduce((sum, r) => sum + r.distanceKm, 0);
    const fuel = monthRoutes.reduce((sum, r) => sum + r.fuelUsed, 0);
    return {
      name: date.toLocaleDateString('tr-TR', { month: 'short' }),
      distance: Math.round(distance),
      fuel: Math.round(fuel)
    };
  });

  const totalDistance = routes.reduce((sum, route) => sum + route.distanceKm, 0);
  const totalFuelUsed = routes.reduce((sum, route) => sum + route.fuelUsed, 0);
  const averageEfficiency = totalFuelUsed > 0 ? (totalDistance / totalFuelUsed).toFixed(1) : 0;

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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">Fleet performance insights and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-32"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Distance</p>
              <p className="text-2xl font-bold text-gray-900">{totalDistance.toLocaleString()} km</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <Fuel className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fuel Used</p>
              <p className="text-2xl font-bold text-gray-900">{totalFuelUsed.toFixed(1)} L</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">{averageEfficiency} km/L</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fuel Efficiency Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Efficiency Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fuelEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Usage Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehicleUsageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="usage"
              >
                {vehicleUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="distance" fill="#3b82f6" name="Distance (km)" />
            <Bar yAxisId="right" dataKey="fuel" fill="#10b981" name="Fuel (L)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Performing Vehicles */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Vehicles</h3>
          <div className="space-y-3">
            {vehicles.slice(0, 5).map((vehicle, index) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{vehicle.licensePlate}</p>
                    <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{vehicle.mileage.toLocaleString()} km</p>
                  <p className="text-xs text-gray-600">{vehicle.fuelLevel}% fuel</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Statistics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Routes</span>
              <span className="font-semibold text-gray-900">{routes.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Distance</span>
              <span className="font-semibold text-gray-900">
                {routes.length > 0 ? (totalDistance / routes.length).toFixed(1) : 0} km
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Fuel per Route</span>
              <span className="font-semibold text-gray-900">
                {routes.length > 0 ? (totalFuelUsed / routes.length).toFixed(1) : 0} L
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Longest Route</span>
              <span className="font-semibold text-gray-900">
                {Math.max(...routes.map(r => r.distanceKm), 0)} km
              </span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Efficiency Improved</span>
              </div>
              <p className="text-xs text-green-700 mt-1">Fuel efficiency increased by 5% this month</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Distance Increased</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">Total distance covered increased by 12%</p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Route Optimization</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">Consider optimizing routes to reduce fuel consumption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
