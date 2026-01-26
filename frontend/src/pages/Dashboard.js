import React, { useState, useEffect } from 'react';
import { Truck, Navigation, AlertTriangle, Activity, TrendingUp, Clock, Fuel, MapPin, ArrowUpRight } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import { getVehicles, getRoutes, getNotifications } from '../services/api';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesData, routesData, notificationsData] = await Promise.all([
        getVehicles(),
        getRoutes(),
        getNotifications()
      ]);
      setVehicles(vehiclesData || []);
      setRoutes(routesData || []);
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeVehicles = vehicles.filter(v => 
    routes.filter(r => r.vehicleId === v.id).some(r => r.status === 1)
  );
  const activeRoutes = routes.filter(r => r.status === 1);
  const completedRoutes = routes.filter(r => r.status === 2);
  const totalDistance = routes.reduce((sum, r) => sum + r.distanceKm, 0);
  const totalFuel = routes.reduce((sum, r) => sum + r.fuelUsed, 0);
  const avgEfficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(1) : 0;

  const stats = [
    { 
      name: 'Aktif Araçlar', 
      value: activeVehicles.length, 
      total: vehicles.length,
      icon: Truck, 
      color: 'blue',
      change: '+2',
      changeType: 'count'
    },
    { 
      name: 'Aktif Rotalar', 
      value: activeRoutes.length, 
      total: routes.length,
      icon: Navigation, 
      color: 'emerald',
      change: '+5',
      changeType: 'count'
    },
    { 
      name: 'Toplam Mesafe', 
      value: Math.round(totalDistance), 
      unit: 'km',
      icon: MapPin, 
      color: 'purple',
      change: '+12%',
      changeType: 'percent'
    },
    { 
      name: 'Ort. Verimlilik', 
      value: avgEfficiency, 
      unit: 'km/L',
      icon: Fuel, 
      color: 'orange',
      change: '+3.2%',
      changeType: 'percent'
    }
  ];

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
    return {
      name: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
      efficiency: totalFuel > 0 ? parseFloat((totalDistance / totalFuel).toFixed(2)) : 0,
      routes: dayRoutes.length,
      distance: Math.round(totalDistance)
    };
  });

  const recentRoutes = routes
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 5);

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
      emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200' },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200' },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Filo yönetimi ve performans özeti</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Son güncelleme</div>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button
            onClick={fetchData}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const colors = getColorClasses(stat.color);
          return (
            <div key={stat.name} className={`stat-card border-l-4 ${colors.border}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <stat.icon className={`h-6 w-6 ${colors.icon}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value.toLocaleString('tr-TR')}
                    </p>
                    {stat.unit && (
                      <span className="text-lg text-gray-500 font-medium">{stat.unit}</span>
                    )}
                  </div>
                  {stat.total !== undefined && (
                    <p className="text-sm text-gray-500 mb-3">Toplam: {stat.total}</p>
                  )}
                  {stat.change && (
                    <div className="flex items-center space-x-1.5">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 rounded-md">
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-600">{stat.change}</span>
                      </div>
                      <span className="text-xs text-gray-500">geçen hafta</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Yakıt Verimliliği Trendi</h3>
              <p className="text-sm text-gray-500 mt-1">Son 7 gün</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">+5.2%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#colorEfficiency)"
                dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Günlük Rota Aktivitesi</h3>
              <p className="text-sm text-gray-500 mt-1">Son 7 gün</p>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Toplam: </span>
              <span className="font-bold text-gray-900">{routes.length}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px'
                }} 
              />
              <Bar 
                dataKey="routes" 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Routes */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Son Rotalar</h3>
            <button className="btn-ghost text-sm flex items-center space-x-1">
              <span>Tümünü Gör</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Araç</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rota</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mesafe</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Yakıt</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRoutes.length > 0 ? recentRoutes.map((route) => {
                  const vehicle = vehicles.find(v => v.id === route.vehicleId);
                  const statusText = ['Başlamadı', 'Devam Ediyor', 'Tamamlandı'][route.status] || 'Bilinmiyor';
                  const statusBadge = route.status === 2 
                    ? 'badge-success' 
                    : route.status === 1 
                    ? 'badge-info' 
                    : 'badge-neutral';
                  const efficiency = route.fuelUsed > 0 ? (route.distanceKm / route.fuelUsed).toFixed(1) : 0;
                  return (
                    <tr key={route.id} className="table-row">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {vehicle?.licensePlate || 'Bilinmiyor'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {vehicle?.make} {vehicle?.model}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {route.startLocation}
                        </div>
                        <div className="text-xs text-gray-500">
                          → {route.endLocation}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {Math.round(route.distanceKm)} km
                        </div>
                        <div className="text-xs text-gray-500">
                          {efficiency} km/L
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {route.fuelUsed.toFixed(1)} L
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`badge ${statusBadge}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="text-gray-400 mb-2">
                        <Navigation className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-500">Henüz rota bulunmuyor</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Hızlı İstatistikler</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Tamamlanan Rotalar</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{completedRoutes.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Toplam Araç</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{vehicles.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Aktif Uyarılar</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{notifications.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Fuel className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Toplam Yakıt</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{totalFuel.toFixed(1)} L</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Sistem Durumu</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-sm font-medium text-emerald-700">API Bağlantısı</span>
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-xs font-semibold text-emerald-700">Aktif</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-sm font-medium text-emerald-700">Veritabanı</span>
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-xs font-semibold text-emerald-700">Bağlı</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Son Senkronizasyon</span>
                <span className="text-xs font-semibold text-gray-900">
                  {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
