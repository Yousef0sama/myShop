import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import uiReducer from './slices/uiSlice';
import productsReducer from './slices/productsSlice';

// * Primary Redux store instance configuring combined slice reducers and middleware
const store = configureStore({
  reducer: {
    auth: authReducer, // ? User token, profile attributes, and authentication status state
    profile: profileReducer, // ? Saved user addresses, payment methods, and profile preferences
    ui: uiReducer, // ? App layout state including active language (RTL/LTR) and dark mode
    products: productsReducer, // ? Product catalog listing, categories, and CRUD status
  },
});

export default store;