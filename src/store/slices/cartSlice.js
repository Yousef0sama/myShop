import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';

const initialState = { id: null, userId: null, items: [], status: 'idle', error: null };

export const fetchCart = createAsyncThunk('cart/fetch', async (userId, { rejectWithValue }) => {
  try {
    const cart = await cartService.getByUser(userId);
    return cart || { id: null, userId, items: [] };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ userId, product }, { rejectWithValue }) => {
    try {
      const existing = await cartService.getByUser(userId);
      const items = [...(existing?.items || [])];
      const index = items.findIndex((item) => item.productId === product.id);
      if (index >= 0) {
        if (items[index].quantity >= product.stock)
          throw new Error('Only available stock can be added to the cart.');
        items[index] = { ...items[index], quantity: items[index].quantity + 1 };
      } else {
        if (product.stock < 1) throw new Error('This product is out of stock.');
        items.push({ productId: product.id, quantity: 1, price: product.price });
      }
      return await cartService.save({ ...(existing || {}), userId, items });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const setCartQuantity = createAsyncThunk(
  'cart/setQuantity',
  async ({ userId, productId, quantity, stock }, { rejectWithValue }) => {
    try {
      const cart = await cartService.getByUser(userId);
      if (!cart) throw new Error('Cart was not found.');
      if (quantity < 1 || quantity > stock)
        throw new Error('Quantity must be within available stock.');
      const items = cart.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      return await cartService.save({ ...cart, items });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const cart = await cartService.getByUser(userId);
      if (!cart) return { id: null, userId, items: [] };
      return await cartService.save({
        ...cart,
        items: cart.items.filter((item) => item.productId !== productId),
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk('cart/clear', async (userId, { rejectWithValue }) => {
  try {
    const cart = await cartService.getByUser(userId);
    return cart ? await cartService.save({ ...cart, items: [] }) : { id: null, userId, items: [] };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: () => initialState,
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.status = 'succeeded';
          Object.assign(state, action.payload);
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Cart request failed.';
        }
      );
  },
});
export const { resetCart, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
