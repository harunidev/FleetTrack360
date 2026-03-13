import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT token varsa her isteğe ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 yanıtlarında token temizle
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Vehicles API
export const getVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const getVehicleById = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (vehicle) => {
  const response = await api.post('/vehicles', vehicle);
  return response.data;
};

export const updateVehicle = async (id, vehicle) => {
  const response = await api.put(`/vehicles/${id}`, vehicle);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};

// Routes API
export const getRoutes = async () => {
  const response = await api.get('/routes');
  return response.data;
};

export const getRouteById = async (id) => {
  const response = await api.get(`/routes/${id}`);
  return response.data;
};

export const getRoutesByVehicle = async (vehicleId) => {
  const response = await api.get(`/routes/vehicle/${vehicleId}`);
  return response.data;
};

export const createRoute = async (route) => {
  const response = await api.post('/routes', route);
  return response.data;
};

export const updateRoute = async (id, route) => {
  return api.put(`/routes/${id}`, route);
};

// Notifications API
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const createNotification = async (notification) => {
  const response = await api.post('/notifications', notification);
  return response.data;
};

// Reports API
export const getDailyReport = async () => {
  const response = await api.get('/reports/daily');
  return response.data;
};

// Auth API
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export default api;
