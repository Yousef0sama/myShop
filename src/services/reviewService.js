import api from './api';
import { ENDPOINTS } from './endpoints';

export const reviewService = {
  async getByProduct(productId) {
    const { data } = await api.get(ENDPOINTS.REVIEWS, { params: { productId } });
    return data;
  },
  async create(review) {
    const { data } = await api.post(ENDPOINTS.REVIEWS, review);
    return data;
  },
};
