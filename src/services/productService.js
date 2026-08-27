import api from './api';
import { ENDPOINTS } from './endpoints';

// * Product catalog management and category retrieval service layer
export const productService = {
  // * Retrieve list of all products with optional query filtering and pagination
  getAll: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PRODUCTS, { params });
    return response.data;
  },

  // * Fetch detailed product information by unique item ID
  getById: async (id) => {
    const response = await api.get(`${ENDPOINTS.PRODUCTS}/${id}`);
    return response.data;
  },

  // * Create a new product entry in the catalog database
  create: async (productData) => {
    const response = await api.post(ENDPOINTS.PRODUCTS, productData);
    return response.data;
  },

  // * Apply partial updates to an existing product record
  update: async (id, productData) => {
    const response = await api.patch(`${ENDPOINTS.PRODUCTS}/${id}`, productData);
    return response.data;
  },

  // ! Remove a product permanently from the catalog by ID
  delete: async (id) => {
    const response = await api.delete(`${ENDPOINTS.PRODUCTS}/${id}`);
    return response.data;
  },

  // ? Fetch all available product categories for navigation and filtering
  getCategories: async () => {
    const response = await api.get(ENDPOINTS.CATEGORIES);
    return response.data;
  },
};