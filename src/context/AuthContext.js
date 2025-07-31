import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.get('/users/me')
        .then(res => setUser(res.data))
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    // Fetch user profile after login
    const userRes = await api.get('/users/me');
    setUser(userRes.data);
  };

  const register = async (name, email, password) => {
    const res = await apiRegister(name, email, password);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    // Fetch user profile after register
    const userRes = await api.get('/users/me');
    setUser(userRes.data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 