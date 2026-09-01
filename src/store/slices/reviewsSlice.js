import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from '../../services/reviewService';

/**
 * Async Thunk: Fetch reviews specifically for a single product ID
 */
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await reviewService.getByProduct(productId);
      return { productId, reviews: data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch reviews for this product.';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async Thunk: Create and submit a new review for a product
 */
export const addReview = createAsyncThunk(
  'reviews/addReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const data = await reviewService.create(reviewData);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit the review. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async Thunk: Update an existing review by ID
 */
export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      const data = await reviewService.update(id, reviewData);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update the review. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async Thunk: Delete a review by ID and product ID
 */
export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ id, productId }, { rejectWithValue }) => {
    try {
      await reviewService.delete(id);
      return { id, productId };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete the review. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  byProductId: {}, // Normalized state: { [productId]: [reviews] }
  loading: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    /**
     * Clear all cached reviews by product ID
     */
    clearReviews: (state) => {
      state.byProductId = {};
      state.error = null;
    },
    /**
     * Clear existing review error messages
     */
    clearReviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reviews By Product ID
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, reviews } = action.payload;
        state.byProductId[productId] = reviews;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Review
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.loading = false;
        const newReview = action.payload;
        const productId = newReview.productId;
        if (state.byProductId[productId]) {
          state.byProductId[productId].unshift(newReview);
        } else {
          state.byProductId[productId] = [newReview];
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReview = action.payload;
        const productId = updatedReview.productId;
        if (state.byProductId[productId]) {
          state.byProductId[productId] = state.byProductId[productId].map(
            (review) => (review.id === updatedReview.id ? updatedReview : review)
          );
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        const { id, productId } = action.payload;
        if (state.byProductId[productId]) {
          state.byProductId[productId] = state.byProductId[productId].filter(
            (review) => review.id !== id
          );
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviews, clearReviewError } = reviewsSlice.actions;
export default reviewsSlice.reducer;