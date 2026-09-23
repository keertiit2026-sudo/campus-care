import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

const TOKEN_KEY = 'campuscare_jwt_token';
const USER_KEY = 'campuscare_user_profile';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  // Sync token and user profile
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.token);
      setUser(res.user);
      if (res.token) localStorage.setItem(TOKEN_KEY, res.token);
      if (res.user) localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setAuthModalOpen(false);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  // Register student handler
  const register = async (studentData) => {
    setLoading(true);
    try {
      const res = await api.register(studentData);
      setToken(res.token);
      setUser(res.user);
      if (res.token) localStorage.setItem(TOKEN_KEY, res.token);
      if (res.user) localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setAuthModalOpen(false);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  // Secure Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
