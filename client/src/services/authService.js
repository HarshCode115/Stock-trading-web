import api from './api';

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (!response || !response.data) {
        console.error('Invalid API response during login');
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (!response || !response.data) {
        console.error('Invalid API response during registration');
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Registration service error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      if (!response || !response.data) {
        console.error('Invalid API response when getting current user');
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Get current user service error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (!response || !response.data) {
        console.error('Invalid API response during profile update');
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Profile update service error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      if (!response || !response.data) {
        console.error('Invalid API response during password change');
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Password change service error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      if (!response || !response.data) {
        console.error('Invalid API response during logout');
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Logout service error:', error);
      throw error;
    }
  },
};

export default authService;
