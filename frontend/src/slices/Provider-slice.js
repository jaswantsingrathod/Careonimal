import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const createProvider = createAsyncThunk(
  "provider/createProvider",
  // pass a FormData or plain object as 'payload'
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/providers/register", formData, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      console.log("createProvider axios response:", res); // full response
      console.log("createProvider res.data:", res.data);
      return res.data; // whatever backend returns
    } catch (err) {
      // safe error extraction
      console.error("createProvider - axios error object:", err);
      console.error("createProvider - err.response:", err?.response);
      console.error(
        "createProvider - err.response?.status:",
        err?.response?.status
      );
      console.error(
        "createProvider - err.response?.data:",
        err?.response?.data
      );
      console.log(err?.response?.data?.error);
      return rejectWithValue(
        err?.response?.data?.error || "Create provider failed"
      );
    }
  }
);

const providerSlice = createSlice({
  name: "provider",
  initialState: {
    provider: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProviderState(state) {
      state.provider = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.provider = action.payload;
      })
      .addCase(createProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create provider";
      });
  },
});

export const { clearProviderState } = providerSlice.actions;
export default providerSlice.reducer;
