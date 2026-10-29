import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1');

// Ensure a persistent guest ID for unauthenticated cart sessions
export const getGuestId = () => {
  let guestId = localStorage.getItem('shopsphere_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 12);
    localStorage.setItem('shopsphere_guest_id', guestId);
  }
  return guestId;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // If token is stored in memory/storage (optional fallback for non-cookie setups)
  const token = localStorage.getItem('shopsphere_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    // Normalize response payload so callers using either res.data or res.data.data work seamlessly
    if (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object') {
      try {
        if (!('data' in payload.data)) {
          Object.defineProperty(payload.data, 'data', {
            get() { return this; },
            configurable: true,
            enumerable: false
          });
        }
      } catch {
        // Safe fallback in case of frozen objects
      }
    }
    return payload;
  },
  (error) => {
    const validationMessages = error.response?.data?.errors
      ?.map((item) => item.field ? `${item.field.replace('body.', '')}: ${item.message}` : item.message)
      .filter(Boolean);
    const message =
      validationMessages?.join(', ') ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
