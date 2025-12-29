import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const makeReview = createAsyncThunk(
  "review/makeReview",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/reviews/make-review", payload, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data.review;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to submit review"
      );
    }
  }
);

// PUBLIC: get ALL reviews 
export const fetchAllReviews = createAsyncThunk(
  "review/fetchAllReviews",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/reviews/all");
      // backend: array of reviews
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to load reviews"
      );
    }
  }
);

// PROVIDER DASHBOARD: get reviews for logged-in provider
export const fetchMyProviderReviews = createAsyncThunk(
  "review/fetchMyProviderReviews",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/reviews/my-reviews", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return [];
      }
      return rejectWithValue(
        err.response?.data?.error || "Failed to load provider reviews"
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState: {
    items: [],   
    all: [],    
    loading: false,
    error: null,
  },
  reducers: {
    setProviderReviewsFromAll: (state, action) => {
      const providerId = action.payload;
      state.items = state.all.filter((r) => {
        const pid =
          typeof r.provider === "string"
            ? r.provider
            : r.provider?._id;
        return String(pid) === String(providerId);
      });
    },
    clearReviews: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(makeReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makeReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload); // add new review to items

      })
      .addCase(makeReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.all = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMyProviderReviews put into `items` (for provider dashboard)
      .addCase(fetchMyProviderReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProviderReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyProviderReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { setProviderReviewsFromAll, clearReviews } =
  reviewSlice.actions;
export default reviewSlice.reducer;
