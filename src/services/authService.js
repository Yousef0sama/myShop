import api from './api';
import { ENDPOINTS } from './endpoints';

// * Authentication service layer (Handles core identity & session logic)
export const authService = {
  // * Authenticate user using email and password
  login: async (email, password) => {
    const response = await api.post(ENDPOINTS.LOGIN, { email, password });
    if (response.data.user?.isDeleted || response.data.user?.isRestricted) {
      throw new Error('This account is unavailable. Please contact support.');
    }
    return response.data; // Returns { accessToken, user }
  },

  // * Create a new user account with basic profile payload
  register: async (userData) => {
    const payload = {
      ...userData,
      role: userData.role || 'customer',
      isDeleted: false,
      isRestricted: false,
    };
    const response = await api.post(ENDPOINTS.REGISTER, payload);
    return response.data; // Returns { accessToken, user }
  },

  // ? Check if an account already exists for a given email address
  checkEmailExists: async (email) => {
    const response = await api.get(`${ENDPOINTS.USERS}?email=${email}`);
    return response.data.length > 0;
  },

  // * Fetch detailed user record by unique account ID
  getUserById: async (id) => {
    const response = await api.get(`${ENDPOINTS.USERS}/${id}`);
    return response.data;
  },
};
