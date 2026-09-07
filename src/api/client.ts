import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://jobbee-jhq5.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobbee_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('jobbee_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = res.data.data;
          localStorage.setItem('jobbee_access_token', access_token);
          if (newRefreshToken) {
            localStorage.setItem('jobbee_refresh_token', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('jobbee_access_token');
          localStorage.removeItem('jobbee_refresh_token');
          localStorage.removeItem('jobbee_user');
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      } else {
        localStorage.removeItem('jobbee_access_token');
        localStorage.removeItem('jobbee_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);
