import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';
import { getNotifications, getVehicles } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notificationsData, vehiclesData] = await Promise.all([
        getNotifications(),
        getVehicles()
      ]);
      setNotifications(notificationsData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };


  const getVehicleByLicensePlate = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 0: // LowFuel
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 1: // RouteDeviation
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (type) => {
    switch (type) {
      case 0: // LowFuel
      case 1: // RouteDeviation
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Bildirim tipini enum'dan string'e çevir
  const getNotificationTypeString = (type) => {
    switch (type) {
      case 0: return 'low_fuel';
      case 1: return 'route_deviation';
      default: return 'other';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const vehicle = getVehicleByLicensePlate(notification.vehicleId);
    const notificationType = getNotificationTypeString(notification.type);
    const matchesSearch = vehicle && (
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    let matchesFilter = true;
    if (filter === 'high') {
      matchesFilter = notificationType === 'low_fuel' || notificationType === 'route_deviation';
    } else if (filter === 'today') {
      const today = new Date();
      const notificationDate = new Date(notification.date);
      matchesFilter = notificationDate.toDateString() === today.toDateString();
    }
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = 0;

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
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-gray-600">Fleet alerts and important updates</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Tüm Bildirimler</option>
              <option value="high">Yüksek Öncelik</option>
              <option value="today">Bugün</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up! No new notifications to show.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const vehicle = getVehicleByLicensePlate(notification.vehicleId);
            return (
              <div
                key={notification.id}
                className={`card hover:shadow-lg transition-shadow duration-200 ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </h3>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(notification.type)}`}>
                        {notification.type === 0 ? 'Yüksek' : 'Orta'}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Vehicle: {vehicle?.licensePlate || 'Unknown'}</span>
                        <span>•</span>
                        <span>{vehicle?.make} {vehicle?.model}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(notification.date).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Types Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.type === 0 || n.type === 1).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Bildirim</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bugün</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => {
                  const today = new Date();
                  const notifDate = new Date(n.date);
                  return notifDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-100">
              <Bell className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
