import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

const initialState = { items: [], status: 'idle', error: null };
export const fetchOrders = createAsyncThunk('orders/fetch', async (params, { rejectWithValue }) => {
  try {
    return await orderService.getAll(params);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});
export const createOrder = createAsyncThunk('orders/create', async (order, { rejectWithValue }) => {
  try {
    return await orderService.create(order);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});
export const updateOrderStatus = createAsyncThunk(
  'orders/status',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await orderService.update(id, { status });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: { clearOrders: () => initialState },
  extraReducers: (builder) =>
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const i = state.items.findIndex((order) => order.id === action.payload.id);
        if (i >= 0) state.items[i] = action.payload;
      })
      .addMatcher(
        (action) => action.type.startsWith('orders/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Order request failed.';
        }
      ),
});
export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
