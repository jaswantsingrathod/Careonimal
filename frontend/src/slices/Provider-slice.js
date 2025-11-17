// src/store/providerSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const createProvider = createAsyncThunk(
  "provider/createProvider",
  // pass a FormData or plain object as 'payload'
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/providers/register", formData, {headers: {Authorization: localStorage.getItem("token")}});
      console.log("provider", res.data);
      
      return res.data; // whatever backend returns
    } catch (err) {
      // safe error extraction
      const message = err?.response?.data?.error || err?.message || "Create provider failed";
      return rejectWithValue(message);
    }
  }
);

const providerSlice = createSlice({
  name: "provider",
  initialState: {
    provider: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearProviderState(state) {
      state.provider = null;
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.provider = action.payload;
        state.success = "Provider created";
      })
      .addCase(createProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create provider";
      });
  },
});

export const { clearProviderState } = providerSlice.actions;
export default providerSlice.reducer;
