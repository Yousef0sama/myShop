import api from './api';
import { ENDPOINTS } from './endpoints';

export const profileService = {
  getProfile: async (userId) => {
    const response = await api.get(`${ENDPOINTS.USERS}/${userId}`);
    return response.data;
  },

  updateProfile: async (userId, updatedData) => {
    const response = await api.patch(`${ENDPOINTS.USERS}/${userId}`, updatedData);
    return response.data;
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const userResponse = await api.get(`${ENDPOINTS.USERS}/${userId}`);
    const user = userResponse.data;

    try {
      await api.post(ENDPOINTS.LOGIN, {
        email: user.email,
        password: currentPassword,
      });
    } catch (error) {
      throw new Error('Current password is incorrect');
    }

    const response = await api.patch(`${ENDPOINTS.USERS}/${userId}`, {
      password: newPassword,
    });

    return response.data;
  },

  deleteAccount: async (userId) => {
    const response = await api.patch(`${ENDPOINTS.USERS}/${userId}`, {
      isDeleted: true,
    });
    return response.data;
  },

  // User Addresses
  getAddresses: async (userId) => {
    const response = await api.get(`/addresses?userId=${userId}`);
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },

  updateAddress: async (addressId, updatedData) => {
    const response = await api.patch(`/addresses/${addressId}`, updatedData);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  },

  // User Payment Cards
  getCards: async (userId) => {
    const response = await api.get(`/cards?userId=${userId}`);
    return response.data;
  },

  addCard: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },

  deleteCard: async (cardId) => {
    const response = await api.delete(`/cards/${cardId}`);
    return response.data;
  },
};