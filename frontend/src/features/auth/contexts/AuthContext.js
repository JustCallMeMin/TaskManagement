import React, { createContext, useState, useContext, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { LOCAL_STORAGE_KEYS } from '../../../shared/utils/constants';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    
    if (!token || !storedUser) {
      return null;
    }

    try {
      const userData = JSON.parse(storedUser);
      const decodedToken = jwtDecode(token);
      
      // Verify token is valid
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
        return null;
      }

      return userData;
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      return null;
    }
  });

  const login = useCallback(async (credentials) => {
    try {
      const { user } = await authService.login(credentials);
      setUser(user);
      
      // Use the same approach as Google OAuth - force a complete browser navigation
      // This ensures a clean application state with the new authentication credentials
      const targetPath = user.isAdmin ? '/admin/dashboard' : '/dashboard';
      
      console.log('Login successful, navigating to:', targetPath);
      
      // Small delay to ensure localStorage is fully updated before navigation
      setTimeout(() => {
        window.location.replace(targetPath);
      }, 100);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 