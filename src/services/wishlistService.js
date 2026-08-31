import api from './api';
import { ENDPOINTS } from './endpoints';

export const wishlistService = {
  async getByUser(userId) {
    const { data } = await api.get(ENDPOINTS.WISHLISTS, { params: { userId } });
    return data[0] || null;
  },
  async save(wishlist) {
    const { data } = wishlist.id
      ? await api.put(`${ENDPOINTS.WISHLISTS}/${wishlist.id}`, wishlist)
      : await api.post(ENDPOINTS.WISHLISTS, wishlist);
    return data;
  },
};
