import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { wishlistService } from '../../services/wishlistService';

const initialState = { id: null, userId: null, productIds: [], status: 'idle', error: null };
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      return (await wishlistService.getByUser(userId)) || { id: null, userId, productIds: [] };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const toggleWishlistProduct = createAsyncThunk(
  'wishlist/toggle',
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const existing = await wishlistService.getByUser(userId);
      const productIds = existing?.productIds || [];
      const nextIds = productIds.includes(productId)
        ? productIds.filter((id) => id !== productId)
        : [...productIds, productId];
      return await wishlistService.save({ ...(existing || {}), userId, productIds: nextIds });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: { resetWishlist: () => initialState },
  extraReducers: (builder) =>
    builder
      .addMatcher(
        (action) => action.type.startsWith('wishlist/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('wishlist/') && action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.status = 'succeeded';
          Object.assign(state, action.payload);
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('wishlist/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Wishlist request failed.';
        }
      ),
});
export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
