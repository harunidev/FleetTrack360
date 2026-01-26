import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Fuel, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getVehicles, getRoutes } from '../services/api';

const Reports = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [, routesData] = await Promise.all([
        getVehicles(),
        getRoutes()
      ]);
      setRoutes(routesData || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      efficiency: parseFloat(efficiency.toFixed(1)),
      distance: Math.round(totalDistance)
    };
  });

  const totalDistance = routes.reduce((sum, route) => sum + route.distanceKm, 0);
  const totalFuelUsed = routes.reduce((sum, route) => sum + route.fuelUsed, 0);
  const averageEfficiency = totalFuelUsed > 0 ? (totalDistance / totalFuelUsed).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Raporlar</h1>
          <p className="text-sm text-gray-500 mt-1">Filo performans analizi</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Dışa Aktar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Toplam Mesafe</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDistance.toLocaleString('tr-TR')} km</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <Fuel className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Kullanılan Yakıt</p>
              <p className="text-2xl font-semibold text-gray-900">{totalFuelUsed.toFixed(1)} L</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Ort. Verimlilik</p>
              <p className="text-2xl font-semibold text-gray-900">{averageEfficiency} km/L</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Yakıt Verimliliği</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Line type="monotone" dataKey="efficiency" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Günlük Mesafe</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="distance" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
