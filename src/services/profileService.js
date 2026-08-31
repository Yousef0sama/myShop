import api from './api';
import { ENDPOINTS } from './endpoints';

// * User Profile & Related Entities (Addresses / Cards) Service Layer
export const profileService = {
  // ==========================================
  // 1. Personal Profile & Account Operations
  // ==========================================

  // * Fetch full user profile details by ID
  getProfile: async (userId) => {
    const response = await api.get(`${ENDPOINTS.USERS}/${userId}`);
    return response.data;
  },

  // * Update personal basic profile info (Name, Phone, etc.)
  updateProfile: async (userId, updatedData) => {
    const response = await api.patch(`${ENDPOINTS.USERS}/${userId}`, updatedData);
    return response.data;
  },

  // * Change account password
  changePassword: async (userId, newPassword) => {
    const response = await api.patch(`${ENDPOINTS.USERS}/${userId}`, { password: newPassword });
    return response.data;
  },

  // * Soft/Hard delete user account
  deleteAccount: async (userId) => {
    const response = await api.delete(`${ENDPOINTS.USERS}/${userId}`);
    return response.data;
  },

  // ==========================================
  // 2. User Addresses (Independent Entity)
  // ==========================================

  // * Fetch all saved addresses for a specific user
  getAddresses: async (userId) => {
    const response = await api.get(`/addresses?userId=${userId}`);
    return response.data;
  },

  // * Add a new address record
  addAddress: async (addressData) => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },

  // * Update an existing address record by address ID
  updateAddress: async (addressId, updatedData) => {
    const response = await api.patch(`/addresses/${addressId}`, updatedData);
    return response.data;
  },

  // * Delete a specific address record
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  },

  // ==========================================
  // 3. User Payment Cards (Independent Entity)
  // ==========================================

  // * Fetch all saved payment cards for a specific user
  getCards: async (userId) => {
    const response = await api.get(`/cards?userId=${userId}`);
    return response.data;
  },

  // * Save a new payment card record
  addCard: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },

  // * Delete a saved payment card by card ID
  deleteCard: async (cardId) => {
    const response = await api.delete(`/cards/${cardId}`);
    return response.data;
  },
};
