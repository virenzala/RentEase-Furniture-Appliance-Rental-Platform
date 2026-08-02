import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rentease_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Unified Auth services
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('rentease_token', res.data.token);
      localStorage.setItem('rentease_user', JSON.stringify(res.data));
    }
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('rentease_token', res.data.token);
      localStorage.setItem('rentease_user', JSON.stringify(res.data));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('rentease_token');
    localStorage.removeItem('rentease_user');
  },
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('rentease_user');
    return user ? JSON.parse(user) : null;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
  updateProfile: async (userData) => {
    const res = await api.put('/auth/profile', userData);
    if (res.data) {
      localStorage.setItem('rentease_user', JSON.stringify(res.data));
    }
    return res.data;
  },
  forgotPassword: async (email, newPassword) => {
    const res = await api.post('/auth/forgot-password', { email, newPassword });
    return res.data;
  }
};

// Unified Product services
export const productService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    const res = await api.get(`/products?${params.toString()}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  create: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data;
  },
  update: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  }
};

// Unified Rental services
export const rentalService = {
  create: async (rentalData) => {
    const res = await api.post('/rentals', rentalData);
    return res.data;
  },
  getMyRentals: async () => {
    const res = await api.get('/rentals/my');
    return res.data;
  },
  extend: async (rentalId, extraMonths) => {
    const res = await api.put('/rentals/extend', { rentalId, extraMonths });
    return res.data;
  },
  returnItem: async (rentalId) => {
    const res = await api.put('/rentals/return', { rentalId });
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/rentals');
    return res.data;
  }
};

// Unified Maintenance services
export const maintenanceService = {
  create: async (ticketData) => {
    const res = await api.post('/maintenance', ticketData);
    return res.data;
  },
  getMyTickets: async () => {
    const res = await api.get('/maintenance/my');
    return res.data;
  },
  getAllTickets: async () => {
    const res = await api.get('/maintenance');
    return res.data;
  },
  updateStatus: async (ticketId, status) => {
    const res = await api.put(`/maintenance/${ticketId}`, { status });
    return res.data;
  }
};

export default api;
