import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getGuestId } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    try {
      const guestId = getGuestId();
      const res = await api.post('/auth/login', { email, password, guestId });
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('shopsphere_token', res.data.token);
        }
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const guestId = getGuestId();
      const res = await api.post('/auth/register', { name, email, password, guestId });
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('shopsphere_token', res.data.token);
        }
        toast.success('Account created successfully! Welcome to ShopSphere.');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('shopsphere_token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.patch('/users/profile', profileData);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        toast.success('Profile updated successfully');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
