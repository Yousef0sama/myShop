import api from './api';
import { ENDPOINTS } from './endpoints';

export const cartService = {
  async getByUser(userId) {
    const { data } = await api.get(ENDPOINTS.CARTS, { params: { userId } });
    return data[0] || null;
  },
  async save(cart) {
    const { data } = cart.id
      ? await api.put(`${ENDPOINTS.CARTS}/${cart.id}`, cart)
      : await api.post(ENDPOINTS.CARTS, cart);
    return data;
  },
};
