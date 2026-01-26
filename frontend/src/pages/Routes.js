import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { getRoutes, getVehicles, createRoute, updateRoute } from '../services/api';

const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '',
    startLocation: '',
    endLocation: '',
    startTime: '',
    endTime: '',
    distanceKm: 0,
    fuelUsed: 0,
    status: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [routesData, vehiclesData] = await Promise.all([getRoutes(), getVehicles()]);
      setRoutes(routesData || []);
      setVehicles(vehiclesData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRoute(formData);
      setShowModal(false);
      setFormData({
        vehicleId: '',
        startLocation: '',
        endLocation: '',
        startTime: '',
        endTime: '',
        distanceKm: 0,
        fuelUsed: 0,
        status: 0
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert(`Hata: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleStatusChange = async (routeId, newStatus) => {
    try {
      const route = routes.find(r => r.id === routeId);
      if (!route) return;
      await updateRoute(routeId, { ...route, status: parseInt(newStatus) });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredRoutes = routes.filter(route => {
    const vehicle = vehicles.find(v => v.id === route.vehicleId);
    return vehicle && (
      route.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.endLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rotalar</h1>
          <p className="text-sm text-gray-500 mt-1">Araç rotalarını yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Rota</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rota ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Araç</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlangıç</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bitiş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mesafe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yakıt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoutes.map((route) => {
                const vehicle = vehicles.find(v => v.id === route.vehicleId);
                const statusBadge = route.status === 2 
                  ? 'badge-success' 
                  : route.status === 1 
                  ? 'badge-info' 
                  : 'badge-neutral';
                return (
                  <tr key={route.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicle?.licensePlate || 'Bilinmiyor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.startLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.endLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.distanceKm} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.fuelUsed} L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={route.status}
                        onChange={(e) => handleStatusChange(route.id, e.target.value)}
                        className={`badge ${statusBadge} border-0 cursor-pointer`}
                      >
                        <option value="0">Başlamadı</option>
                        <option value="1">Devam Ediyor</option>
                        <option value="2">Tamamlandı</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setShowModal(false)}
            />
            <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Rota</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Araç</label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Araç Seçin</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.licensePlate} - {v.make} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                    <input
                      type="text"
                      value={formData.startLocation}
                      onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                    <input
                      type="text"
                      value={formData.endLocation}
                      onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Zamanı</label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Zamanı</label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mesafe (km)</label>
                    <input
                      type="number"
                      value={formData.distanceKm}
                      onChange={(e) => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yakıt (L)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fuelUsed}
                      onChange={(e) => setFormData({ ...formData, fuelUsed: parseFloat(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn-primary">
                    Ekle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routes;
