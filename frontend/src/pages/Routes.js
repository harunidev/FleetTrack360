import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Clock, Fuel, TrendingUp, Eye } from 'lucide-react';
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
    status: 0 // 0: NotStarted, 1: Ongoing, 2: Completed
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [routesData, vehiclesData] = await Promise.all([
        getRoutes(),
        getVehicles()
      ]);
      console.log('Routes data:', routesData);
      console.log('Vehicles data:', vehiclesData);
      console.log('Vehicles count:', vehiclesData?.length || 0);
      setRoutes(routesData || []);
      setVehicles(vehiclesData || []);
      
      if (!vehiclesData || vehiclesData.length === 0) {
        console.warn('WARNING: Vehicle list is empty! Could not fetch vehicles from backend.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setRoutes([]);
      setVehicles([]);
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
      console.error('Error creating route:', error);
      alert(`Failed to save route: ${error.response?.data?.message || error.message || 'Unknown error occurred'}`);
    }
  };

  const [statusChanges, setStatusChanges] = useState({});

  const handleStatusChange = (routeId, newStatus) => {
    setStatusChanges(prev => ({
      ...prev,
      [routeId]: parseInt(newStatus)
    }));
  };

  const handleSaveStatus = async (routeId) => {
    try {
      const newStatus = statusChanges[routeId];
      if (newStatus === undefined) return;

      const route = routes.find(r => r.id === routeId);
      if (!route) return;

      const updatedRoute = {
        ...route,
        status: newStatus
      };

      await updateRoute(routeId, updatedRoute);
      
      // Remove from pending changes
      setStatusChanges(prev => {
        const next = { ...prev };
        delete next[routeId];
        return next;
      });
      
      fetchData();
    } catch (error) {
      console.error('Error updating route status:', error);
      alert(`Failed to update status: ${error.response?.data?.message || error.message || 'Unknown error occurred'}`);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Not Started';
      case 1: return 'Ongoing';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-gray-100 text-gray-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getVehicleByLicensePlate = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Routes</h1>
          <p className="mt-2 text-gray-600">Track and manage vehicle routes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Route</span>
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {filteredRoutes.map((route) => {
          const vehicle = getVehicleByLicensePlate(route.vehicleId);
          return (
            <div key={route.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <MapPin className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {route.startLocation} → {route.endLocation}
                      </h3>
                      <p className="text-gray-600">
                        Vehicle: {vehicle?.licensePlate || 'Unknown'} ({vehicle?.make} {vehicle?.model})
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Start Time</p>
                        <p className="font-medium text-gray-900">
                          {new Date(route.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">End Time</p>
                        <p className="font-medium text-gray-900">
                          {new Date(route.endTime).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Distance</p>
                        <p className="font-medium text-gray-900">{route.distanceKm} km</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Fuel className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Fuel Used</p>
                        <p className="font-medium text-gray-900">{route.fuelUsed} L</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(statusChanges[route.id] !== undefined ? statusChanges[route.id] : route.status || 0)}`}>
                        {getStatusText(statusChanges[route.id] !== undefined ? statusChanges[route.id] : route.status || 0)}
                      </span>
                      <select
                        value={statusChanges[route.id] !== undefined ? statusChanges[route.id] : (route.status !== undefined ? route.status : 0)}
                        onChange={(e) => handleStatusChange(route.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="0">Not Started</option>
                        <option value="1">Ongoing</option>
                        <option value="2">Completed</option>
                      </select>
                      {statusChanges[route.id] !== undefined && statusChanges[route.id] !== route.status && (
                        <button
                          onClick={() => handleSaveStatus(route.id)}
                          className="ml-2 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          Save
                        </button>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      Duration: {Math.round((new Date(route.endTime) - new Date(route.startTime)) / (1000 * 60 * 60))} hours
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Efficiency: {((route.distanceKm / route.fuelUsed) || 0).toFixed(1)} km/L
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Route Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Route</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                      <select
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                        className="input-field mt-1"
                        required
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles && vehicles.length > 0 ? (
                          vehicles.map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No vehicles found</option>
                        )}
                      </select>
                      {vehicles && vehicles.length === 0 && (
                        <p className="text-sm text-red-600 mt-1">Warning: Vehicle list is empty. Please add a vehicle first.</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Location</label>
                        <input
                          type="text"
                          value={formData.startLocation}
                          onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                          className="input-field mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Location</label>
                        <input
                          type="text"
                          value={formData.endLocation}
                          onChange={(e) => setFormData({...formData, endLocation: e.target.value})}
                          className="input-field mt-1"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                          type="datetime-local"
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          className="input-field mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                          type="datetime-local"
                          value={formData.endTime}
                          onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                          className="input-field mt-1"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                        <input
                          type="number"
                          value={formData.distanceKm}
                          onChange={(e) => setFormData({...formData, distanceKm: parseFloat(e.target.value)})}
                          className="input-field mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fuel Used (L)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.fuelUsed}
                          onChange={(e) => setFormData({...formData, fuelUsed: parseFloat(e.target.value)})}
                          className="input-field mt-1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
                        className="input-field mt-1"
                        required
                      >
                        <option value="0">Not Started</option>
                        <option value="1">Ongoing</option>
                        <option value="2">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    Add Route
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancel
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
