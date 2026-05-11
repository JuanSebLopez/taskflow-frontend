import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshSessionRequest = null;

const clearStoredSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('token');
};

const persistSessionTokens = ({ accessToken, refreshToken }) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.removeItem('token');
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refreshToken = localStorage.getItem('refreshToken');
    const isAuthRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
    const isLoginRequest = originalRequest?.url?.includes('/auth/login');

    if (status !== 401 || !refreshToken || originalRequest?._retry || isAuthRefreshRequest || isLoginRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshSessionRequest) {
        refreshSessionRequest = axios.post(`${apiBaseUrl}/auth/refresh`, { refreshToken });
      }

      const { data } = await refreshSessionRequest;
      persistSessionTokens(data);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearStoredSession();
      return Promise.reject(refreshError);
    } finally {
      refreshSessionRequest = null;
    }
  }
);

export const getApiErrorMessage = (error, fallback = 'Ocurrio un error inesperado.') => {
  return error.response?.data?.message || fallback;
};

export { clearStoredSession, persistSessionTokens };

export default apiClient;
