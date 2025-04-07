import React, { createContext, useState, useContext } from 'react';
import { authService } from '../features/auth/services/auth.service';
import { LOCAL_STORAGE_KEYS } from '../shared/utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (token, userData) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  };
  
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const verifySecurityCode = async (code) => {
    setLoading(true);
    try {
      const response = await authService.verifySecurityCode(code);
      return response;
    } catch (err) {
      setError(err.message || 'Verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        register,
        verifySecurityCode,
        setLoading, 
        setError 
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

export default AuthContext; 