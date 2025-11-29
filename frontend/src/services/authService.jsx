// frontend/src/services/authService.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Verify role is present
      if (!data.user || !data.user.role) {
        console.error('⚠️ WARNING: User role is missing in response!');
        console.error('Response data:', data);
      }

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('✅ Login successful - User saved:', {
        email: data.user.email,
        role: data.user.role
      });

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register
  register: async (name, email, password, role) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;

      const user = JSON.parse(userStr);

      // Verify role exists
      if (!user.role) {
        console.warn('⚠️ User object missing role field:', user);
      }

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Logged out successfully');
  },

  // Update user in localStorage (useful after profile updates)
  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  },
};