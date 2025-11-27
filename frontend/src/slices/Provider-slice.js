import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const createProvider = createAsyncThunk(
  "provider/createProvider",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/providers/register", formData, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      console.log("createProvider res.data:", res.data);
      return res.data;
    } catch (err) {
      console.log(err?.response?.data?.error);
      return rejectWithValue(
        err?.response?.data?.error || "Create provider failed"
      );
    }
  }
);

export const updateProvider = createAsyncThunk(
  "provider/updateProvider",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/provider/account/update/${id}`, formData, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      console.log(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      const message = err?.response?.data?.error || err.message;
      console.log(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "provider/deleteAccount",
  async ( id , { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `/provider/account/delete/${id}`,
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      console.log(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err);
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
    builder
      .addCase(updateProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProvider.fulfilled, (state, action) => {
        (state.loading = false), (state.provider = action.payload);
      })
      .addCase(updateProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create provider";
      });
    builder
      .addCase(deleteAccount.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        (state.loading = false), (state.provider = null);
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        (state.loading = false),
          (state.error = action.payload || "Failed to delete your account");
      });
  },
});

export const { clearProviderState } = providerSlice.actions;
export default providerSlice.reducer;
