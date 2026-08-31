import api from './api';
import { ENDPOINTS } from './endpoints';

export const orderService = {
  async getAll(params = {}) {
    const { data } = await api.get(ENDPOINTS.ORDERS, { params });
    return data;
  },
  async create(order) {
    const { data } = await api.post(ENDPOINTS.ORDERS, order);
    return data;
  },
  async update(id, changes) {
    const { data } = await api.patch(`${ENDPOINTS.ORDERS}/${id}`, changes);
    return data;
  },
};
