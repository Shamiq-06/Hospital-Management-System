import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Patient API
export const patientAPI = {
  createOrUpdateProfile: (data) => api.post('/patients/profile', data),
  getProfile: () => api.get('/patients/profile'),
  searchDoctors: (params) => api.get('/patients/doctors/search', { params }),
  getDoctorDetails: (id) => api.get(`/patients/doctors/${id}`),
  getAppointments: (params) => api.get('/patients/appointments', { params }),
  getAppointmentById: (id) => api.get(`/patients/appointments/${id}`),
  getSpecializations: () => api.get('/patients/specializations'),
};

// Doctor API
export const doctorAPI = {
  createOrUpdateProfile: (data) => api.post('/doctors/profile', data),
  getProfile: () => api.get('/doctors/profile'),
  createAvailability: (data) => api.post('/doctors/availability', data),
  getAvailability: (params) => api.get('/doctors/availability', { params }),
  updateAvailability: (id, data) => api.put(`/doctors/availability/${id}`, data),
  deleteAvailability: (id) => api.delete(`/doctors/availability/${id}`),
  getAppointments: (params) => api.get('/doctors/appointments', { params }),
  updateAppointmentStatus: (id, data) => api.put(`/doctors/appointments/${id}/status`, data),
  addConsultationNotes: (id, data) => api.put(`/doctors/appointments/${id}/notes`, data),
  getStatistics: () => api.get('/doctors/statistics'),
};

// Appointment API
export const appointmentAPI = {
  createAppointment: (data) => api.post('/appointments', data),
  getDoctorAvailability: (doctorId, params) => api.get(`/appointments/availability/${doctorId}`, { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  rescheduleAppointment: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  cancelAppointment: (id, data) => api.put(`/appointments/${id}/cancel`, data),
};

// Payment API
export const paymentAPI = {
  createPayment: (data) => api.post('/payments/create', data),
  executePayment: (data) => api.post('/payments/execute', data),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  getUserPayments: (params) => api.get('/payments', { params }),
  verifyPayment: (id) => api.get(`/payments/${id}/verify`),
  refundPayment: (id, data) => api.post(`/payments/${id}/refund`, data),
};

// Admin API
export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllDoctors: (params) => api.get('/admin/doctors', { params }),
  updateDoctorApproval: (id, data) => api.put(`/admin/doctors/${id}/approval`, data),
  getAllPatients: (params) => api.get('/admin/patients', { params }),
  getAllAppointments: (params) => api.get('/admin/appointments', { params }),
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  getSystemStatistics: () => api.get('/admin/statistics'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getNotificationById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getNotificationStats: () => api.get('/notifications/stats'),
};

export default api;
