import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios base URL dynamically based on environment.
// 1. If REACT_APP_API_BASE_URL is provided, use it.
// 2. Otherwise, if running on localhost, default to http://localhost:5000 (matching default server port).
// 3. In production, use the current origin so that relative API paths work behind reverse proxies.

const getDefaultApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim() !== '') {
    return process.env.REACT_APP_API_BASE_URL.trim();
  }

  // When served from the same host/port (e.g., in production behind Nginx), we can use a relative path.
  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost') {
    return '';
  }

  // Development fallback
  return 'http://localhost:5000';
};

axios.defaults.baseURL = getDefaultApiBaseUrl();
axios.defaults.timeout = 10000; // 10 second timeout
axios.defaults.withCredentials = false; // Disable credentials for CORS

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    console.log('Setting up axios with baseURL:', axios.defaults.baseURL);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Login attempt ${attempt} with baseURL:`, axios.defaults.baseURL);
        
        // Create a fresh axios instance for this request to avoid any cached issues
        const loginAxios = axios.create({
          baseURL: axios.defaults.baseURL,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const response = await loginAxios.post('/api/auth/login', { email, password });
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        toast.success('Login successful!');
        return { success: true };
      } catch (error) {
        lastError = error;
        console.error(`Login attempt ${attempt} failed:`, {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          baseURL: axios.defaults.baseURL
        });
        
        // If it's a network error and not the last attempt, wait a bit and retry
        if (attempt < maxRetries && (error.code === 'ECONNABORTED' || error.message.includes('Network Error'))) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay
          continue;
        }
      }
    }

    const message = lastError.response?.data?.error || lastError.message || 'Login failed';
    toast.error(message);
    return { success: false, error: message };
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 