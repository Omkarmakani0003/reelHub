import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../../../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    setLoading(true);

    try {
      const response = await api.post('/login', credentials);
      const data = response?.data?.data ?? response?.data ?? {};

      if (data.accessToken) {
        setAccessToken(data.accessToken);
      }

      if (data.user) {
        setUser(data.user);
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await api.post('/logout', {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      }
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.post('/refresh', {});
        const data = response?.data?.data ?? response?.data ?? {};

        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }

        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(accessToken),
    }),
    [user, accessToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

export default AuthContext;
