import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';

// * Initial products state structure
const initialState = {
  items: [],
  categories: [],
  status: 'idle', // ? Fetching status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// * Async Thunk: Fetch all products (optionally filtered by category/search query params)
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await productService.getAll(params);
    } catch (error) {
      return rejectWithValue(error.message || 'errors.fetchProductsFailed');
    }
  }
);

// * Async Thunk: Fetch all available product categories
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getCategories();
    } catch (error) {
      return rejectWithValue(error.message || 'errors.fetchCategoriesFailed');
    }
  }
);

// * Async Thunk: Create a new product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      return await productService.create(productData);
    } catch (error) {
      return rejectWithValue(error.message || 'errors.createProductFailed');
    }
  }
);

// * Async Thunk: Update an existing product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      return await productService.update(id, updatedData);
    } catch (error) {
      return rejectWithValue(error.message || 'errors.updateProductFailed');
    }
  }
);

// * Async Thunk: Delete a product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'errors.deleteProductFailed');
    }
  }
);

// * Products Redux Slice Definition
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // * Fetch Products Handlers
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // * Fetch Categories Handlers
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })

      // * Create Product Handlers
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // * Update Product Handlers
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // * Delete Product Handlers
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;
