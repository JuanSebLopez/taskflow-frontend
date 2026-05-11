import apiClient, { clearStoredSession, persistSessionTokens } from './apiClient';

const persistSession = ({ accessToken, refreshToken, user }) => {
  persistSessionTokens({ accessToken, refreshToken });
  return user;
};

export const authApi = {
  async login(credentials) {
    const { data } = await apiClient.post('/auth/login', credentials);
    return persistSession(data);
  },

  async register(payload) {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  async verifyEmail(payload) {
    const { data } = await apiClient.post('/auth/verify-email', payload);
    return persistSession(data);
  },

  async resendVerification(email) {
    const { data } = await apiClient.post('/auth/resend-verification', { email });
    return data;
  },

  async me() {
    const { data } = await apiClient.get('/auth/me');
    return data.user || data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },
};

export { clearStoredSession };
