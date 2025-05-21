// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Axios instance pointed at your backend
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Development/demo shortcut
  const skipLogin = () => {
    const demoUser = { id: 'demo', email: 'demo@analyzemybill.com', name: 'Demo User' };
    const demoSub = { active: true, status: 'active', current_period_end: null };
    localStorage.setItem('token', 'demo-token');
    setUser(demoUser);
    setSubscription(demoSub);
    setLoading(false);
  };

  useEffect(() => {
    async function fetchAuthData() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 1) Fetch user profile
        const profileRes = await api.get('/api/profile');
        setUser(profileRes.data.user);

        // 2) Fetch subscription status
        const subRes = await api.get('/api/subscription');
        setSubscription(subRes.data);
      } catch (err) {
        console.error('Auth fetch error:', err);
        localStorage.removeItem('token');
        setUser(null);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAuthData();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/register', { email, password, name });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSubscription(null);
  };

  const updateProfile = async (name) => {
    const { data } = await api.put('/api/profile', { name });
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        loading,
        login,
        register,
        logout,
        skipLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
