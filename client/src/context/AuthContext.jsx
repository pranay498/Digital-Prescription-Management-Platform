import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.me()
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (body) => {
    const res = await authAPI.register(body);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await authAPI.logout().catch(() => { });
    localStorage.removeItem('token');
    setUser(null);
  };

  // Pull fresh user data from server and update context
  const refreshUser = async () => {
    const data = await authAPI.me();
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);