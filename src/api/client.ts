import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://atilamedika.com/99J9EO560K/api';
const API_KEY = import.meta.env.VITE_API_KEY || 'YOUR_API_KEY_HERE';
const API_USERNAME = import.meta.env.VITE_API_USERNAME || 'admin';
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD || '415basoro';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY,
  },
  // withCredentials: true // Commented out to fix CORS wildcard issue
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // API Key from env
  if (API_KEY) {
    config.headers['X-Api-Key'] = API_KEY;
  }
  
  // Username Permission from env (Server credentials)
  if (API_USERNAME) {
    config.headers['X-Username-Permission'] = API_USERNAME;
  }
  
  // Password Permission from env (Server credentials)
  if (API_PASSWORD) {
    config.headers['X-Password-Permission'] = API_PASSWORD;
  }
  
  // Override with user credentials if available (from reference logic)
  const { user, password } = useAuthStore.getState();
  
  // X-Username-Permission: Use username from store (fallback to kd_dokter or username from object)
  const usernamePermission = user?.kd_dokter || user?.username;
  if (usernamePermission) {
      config.headers['X-Username-Permission'] = usernamePermission;
  }

  // X-Password-Permission: Use password from store (captured during login)
  if (password) {
      config.headers['X-Password-Permission'] = password;
  }
  
  return config;
});

// Response interceptor - auto logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Allow specific endpoints to fail without redirecting (e.g. initial doctor lookup during login)
      // When fetching doctors for OTP, we are not fully logged in yet, so we might not have permission
      // But actually, we should use the newly acquired token for that request.
      
      const requestUrl = error.config.url;
      
      // If error happens during login process (fetching doctors), don't redirect
      if (requestUrl && (requestUrl.includes('/master/list/dokter') || requestUrl.includes('/master/save/mlite_users'))) {
          console.warn('Unauthorized during login flow, likely permission issue:', requestUrl);
          return Promise.reject(error);
      }

      // Check if we are not already on the login page to avoid infinite loops or unnecessary redirects
      if (window.location.pathname !== '/login') {
        // Clear auth state
        useAuthStore.getState().logout();
        
        // Redirect to login
        window.location.href = '/login';
      }
      console.error('Unauthorized access (401). Redirecting to login.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
