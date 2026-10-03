import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('wallet_auth');
  if (!raw) return config;

  try {
    const auth = JSON.parse(raw);
    if (auth?.accessToken) {
      config.headers.Authorization = `${auth.tokenType || 'Bearer'} ${auth.accessToken}`;
    }
  } catch {
    localStorage.removeItem('wallet_auth');
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wallet_auth');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export function getApiError(error, fallback = 'Something went wrong.') {
  const body = error?.response?.data;

  if (body?.validationErrors && Object.keys(body.validationErrors).length > 0) {
    return Object.values(body.validationErrors).join(' · ');
  }

  return body?.message || error?.message || fallback;
}

export default api;
