import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileService } from '../../services/profileService';
import { updateAuthUser } from './authSlice';

// * Initial profile state structure
const initialState = {
  addresses: [],
  cards: [],
  status: 'idle', // ? Fetching status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// * Async Thunk: Update basic user info & sync with Auth State
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({ userId, updatedData }, { dispatch, rejectWithValue }) => {
    try {
      const data = await profileService.updateProfile(userId, updatedData);
      dispatch(updateAuthUser(data));
      return data;
    } catch (error) {
      // ! Return localized error translation key
      return rejectWithValue(error.message || 'errors.updateFailed');
    }
  }
);

// * Async Thunk: Change account password
export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async ({ userId, newPassword }, { rejectWithValue }) => {
    try {
      const data = await profileService.changePassword(userId, newPassword);
      return data;
    } catch (error) {
      // ! Return localized error translation key
      return rejectWithValue(error.message || 'errors.updateFailed');
    }
  }
);

// * Async Thunk: Fetch all saved addresses for the user
export const fetchAddresses = createAsyncThunk(
  'profile/fetchAddresses',
  async (userId, { rejectWithValue }) => {
    try {
      return await profileService.getAddresses(userId);
    } catch (error) {
      // ! Return localized error translation key
      return rejectWithValue(error.message || 'errors.fetchAddressesFailed');
    }
  }
);

// * Async Thunk: Add a new address
export const addAddress = createAsyncThunk(
  'profile/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      return await profileService.addAddress(addressData);
    } catch (error) {
      // ! Return localized error translation key
      return rejectWithValue(error.message || 'errors.addAddressFailed');
    }
  }
);

// * Async Thunk: Update an existing address
export const updateAddress = createAsyncThunk(
  'profile/updateAddress',
  async ({ addressId, updatedData }, { rejectWithValue }) => {
    try {
      return await profileService.updateAddress(addressId, updatedData);
    } catch (error) {
      // ! Return localized error translation key
      return rejectWithValue(error.message || 'errors.updateAddressFailed');
    }
  }
);

// * Async Thunk: Delete an address
export const deleteAddress = createAsyncThunk(
  'profile/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      await profileService.deleteAddress(addressId);
      return addressId;
    } catch (error) {
      // ! Return localized error translation key
      return rejectWithValue(error.message || 'errors.deleteAddressFailed');
    }
  }
);

// * Async Thunk: Fetch saved payment cards
export const fetchCards = createAsyncThunk(
  'profile/fetchCards',
  async (userId, { rejectWithValue }) => {
    try {
      return await profileService.getCards(userId);
    } catch (error) {
      // ! Return localized error translation key
      return rejectWithValue(error.message || 'errors.fetchCardsFailed');
    }
  }
);

// * Async Thunk: Add a new payment card
export const addCard = createAsyncThunk(
  'profile/addCard',
  async (cardData, { rejectWithValue }) => {
    try {
      return await profileService.addCard(cardData);
    } catch (error) {
      // ! Return localized error translation key
      return rejectWithValue(error.message || 'errors.addCardFailed');
    }
  }
);

// * Async Thunk: Delete a payment card
export const deleteCard = createAsyncThunk(
  'profile/deleteCard',
  async (cardId, { rejectWithValue }) => {
    try {
      await profileService.deleteCard(cardId);
      return cardId;
    } catch (error) {
      // ! Return localized error translation key
      return rejectWithValue(error.message || 'errors.deleteCardFailed');
    }
  }
);

// * Profile Redux Slice Definition
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // ? Clear any existing profile-related error
    clearProfileError: (state) => {
      state.error = null;
    },
    // ? Reset entire profile slice state to initial values
    resetProfileState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // * Update Profile Handlers
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // * Change Password Handlers
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // * Addresses Handlers
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex((addr) => addr.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((addr) => addr.id !== action.payload);
      })

      // * Cards Handlers
      .addCase(fetchCards.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cards = action.payload;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addCard.fulfilled, (state, action) => {
        state.cards.push(action.payload);
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.cards = state.cards.filter((card) => card.id !== action.payload);
      });
  },
});

export const { clearProfileError, resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;