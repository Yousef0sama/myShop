import api from './api';
import { ENDPOINTS } from './endpoints';

export const adminService = {
  async getUsers() {
    const { data } = await api.get(ENDPOINTS.USERS);
    return data;
  },
  async updateUser(id, changes) {
    const { data } = await api.patch(`${ENDPOINTS.USERS}/${id}`, changes);
    return data;
  },
  async getCategories() {
    const { data } = await api.get(ENDPOINTS.CATEGORIES);
    return data;
  },
  async createCategory(category) {
    const { data } = await api.post(ENDPOINTS.CATEGORIES, category);
    return data;
  },
  async updateCategory(id, changes) {
    const { data } = await api.patch(`${ENDPOINTS.CATEGORIES}/${id}`, changes);
    return data;
  },
  async deleteCategory(id) {
    await api.delete(`${ENDPOINTS.CATEGORIES}/${id}`);
  },
};
