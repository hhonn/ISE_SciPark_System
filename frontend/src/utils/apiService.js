import api from './api'

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  sendVerifyOTP: () => api.post('/auth/send-verify-otp'),
  verifyAccount: (otp) => api.post('/auth/verify-account', { otp }),
}

// Parking APIs
export const parkingAPI = {
  getAllSpots: () => api.get('/parking/spots'),
  getSpotById: (id) => api.get(`/parking/spots/${id}`),
  getZoneById: (id) => api.get(`/parking/zones/${id}`),
  getSpotsByZone: (zoneId) => api.get(`/parking/zones/${zoneId}/spots`),
  getZones: () => api.get('/parking/zones'),
  checkAvailability: (spotId) => api.get(`/parking/spots/${spotId}/availability`),
}

// Booking APIs
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getActiveBooking: () => api.get('/bookings/active'),
  getHistory: (limit = 10) => api.get(`/bookings/history?limit=${limit}`),
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  completeBooking: (bookingId) => api.put(`/bookings/${bookingId}/complete`),
  extendBooking: (bookingId, hours) => api.put(`/bookings/${bookingId}/extend`, { hours }),
  checkIn: (bookingId) => api.put(`/bookings/${bookingId}/checkin`),
  checkOut: (bookingId) => api.put(`/bookings/${bookingId}/checkout`),
}

// Privileges APIs
export const privilegesAPI = {
  getTiers: () => api.get('/privileges'),
  getPromos: () => api.get('/privileges/promos'),
  subscribe: (tierId, paymentMethod = 'credit') => api.post('/privileges/subscribe', { tierId, paymentMethod }),
  redeemCode: (code) => api.post('/privileges/redeem', { code }),
}

// Vehicle APIs
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  create: (vehicleData) => api.post('/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/vehicles/${id}`),
  setDefault: (id) => api.put(`/vehicles/${id}/default`),
}

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (userData) => api.put('/user/profile', userData),
  changePassword: (passwords) => api.put('/user/change-password', passwords),
  getBookingHistory: (limit = 20) => api.get(`/user/bookings?limit=${limit}`),
}
