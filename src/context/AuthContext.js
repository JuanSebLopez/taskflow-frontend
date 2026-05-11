import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, clearStoredSession } from '../api/authApi';
import { createTheme } from '../utils/themeFactory';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

      if (!token) {
        setReady(true);
        return;
      }

      try {
        const currentUser = await authApi.me();
        setUser(currentUser);
      } catch (error) {
        clearStoredSession();
        setSessionMessage('La sesion expiro. Inicia sesion nuevamente.');
      } finally {
        setReady(true);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const theme = createTheme(user?.theme);
    document.documentElement.dataset.theme = theme.documentTheme;
  }, [user?.theme]);

  const login = useCallback(async (credentials) => {
    const currentUser = await authApi.login(credentials);
    setUser(currentUser);
    setSessionMessage('');
    return currentUser;
  }, []);

  const verifyEmail = useCallback(async (payload) => {
    const currentUser = await authApi.verifyEmail(payload);
    setUser(currentUser);
    setSessionMessage('');
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // La sesion local se limpia incluso si el backend ya invalido el token.
    } finally {
      clearStoredSession();
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    sessionMessage,
    isAuthenticated: Boolean(user),
    login,
    logout,
    verifyEmail,
    updateUser,
  }), [login, logout, ready, sessionMessage, updateUser, user, verifyEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
