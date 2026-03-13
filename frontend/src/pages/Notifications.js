import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Truck } from 'lucide-react';
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
      setNotifications(notificationsData || []);
      setVehicles(vehiclesData || []);
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
      case 0:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 1:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (type) => {
    switch (type) {
      case 0:
      case 1:
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const vehicle = getVehicleByLicensePlate(notification.vehicleId);

    const matchesSearch = searchTerm.trim() === '' || (
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle && vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    let matchesFilter = true;
    if (filter === 'high') {
      matchesFilter = notification.type === 0 || notification.type === 1;
    } else if (filter === 'today') {
      const today = new Date();
      const notificationDate = new Date(notification.date);
      matchesFilter = notificationDate.toDateString() === today.toDateString();
    }

    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-2xl font-semibold text-gray-900">Bildirimler</h1>
          <p className="text-sm text-gray-500 mt-1">Filo uyarıları ve bildirimler</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Bildirim ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="all">Tümü</option>
            <option value="high">Yüksek Öncelik</option>
            <option value="today">Bugün</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bildirim yok</h3>
            <p className="text-gray-500">Tüm bildirimler görüntülendi</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const vehicle = getVehicleByLicensePlate(notification.vehicleId);
            return (
              <div key={notification.id} className="card">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </h3>
                      <span className={`badge ${getPriorityColor(notification.type)}`}>
                        {notification.type === 0 || notification.type === 1 ? 'Yüksek' : 'Orta'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {vehicle && (
                        <>
                          <div className="flex items-center space-x-1">
                            <Truck className="h-4 w-4" />
                            <span>{vehicle.licensePlate}</span>
                          </div>
                          <span>•</span>
                          <span>{vehicle.make} {vehicle.model}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.date).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <button className="flex-shrink-0 p-2 hover:bg-gray-100 rounded">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
