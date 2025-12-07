import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/bookings/create", payload, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.error || "Booking failed";
      console.error("createBooking error:", message);
      return rejectWithValue(message);
    }
  }
);

export const fetchBookingsForUser = createAsyncThunk(
  "booking/fetchBookingsForUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/bookings", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      const data = res.data;
      if (Array.isArray(data.bookings)) return data.bookings;
      if (Array.isArray(data)) return data;
      return data?.bookings ?? data?.data ?? [];
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to fetch bookings";
      console.error("fetchBookingsForUser error:", message);
      return rejectWithValue(message);
    }
  }
);

export const fetchBookingsForProvider = createAsyncThunk(
  "booking/fetchBookingsForProvider",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/bookings/provider", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      const data = res.data;
      if (Array.isArray(data.bookings)) return data.bookings;
      if (Array.isArray(data)) return data;
      return data?.bookings ?? data?.data ?? [];
    } catch (err) {
      const message =
        err?.response?.data?.error || "Failed to fetch provider bookings";
      console.error("fetchBookingsForProvider error:", message);
      return rejectWithValue(message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "booking/updateBookingStatus",
  async ({ id, bookingStatus }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `/bookings/status/${id}`,
        { bookingStatus },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to update status";
      console.error("updateBookingStatus error:", message);
      return rejectWithValue(message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/bookings/${id}/cancel`, null, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to cancel booking";
      console.error("cancelBooking error:", message);
      return rejectWithValue(message);
    }
  }
);

export const deleteBooking = createAsyncThunk(
  "booking/deleteBooking",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/bookings/delete/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to delete booking";
      console.error("deleteBooking error:", message);
      return rejectWithValue(message);
    }
  }
);

export const createRazorpayOrder = createAsyncThunk(
  "booking/createRazorpayOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/create-razorpay-order", payload, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      return data; // { success, key, orderId, amount, currency, bookingId }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to create Razorpay order"
      );
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  "booking/verifyRazorpayPayment",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/verify-payment", payload, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      return data; // { success, message, booking }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to verify payment"
      );
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearBookingState(state) {
      state.current = null;
      state.loading = false;
      state.error = null;
    },
    clearBookingList(state) {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // createBooking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        if (action.payload) state.list = [action.payload, ...state.list];
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create booking";
      });

    // fetchBookingsForUser
    builder
      .addCase(fetchBookingsForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingsForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBookingsForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch bookings";
      });

    // fetchBookingsForProvider
    builder
      .addCase(fetchBookingsForProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingsForProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBookingsForProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch provider bookings";
      });

    // updateBookingStatus
    builder
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated && updated._id) {
          state.list = state.list.map((b) =>
            String(b._id) === String(updated._id) ? updated : b
          );
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update booking status";
      });

    // cancelBooking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated && updated._id) {
          state.list = state.list.map((b) =>
            String(b._id) === String(updated._id) ? updated : b
          );
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to cancel booking";
      });

    // deleteBooking
    builder
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state) => {
        state.loading = false;
        // after delete we re-fetch on UI; or remove from list if API returns deleted id
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete booking";
      });

      // createRazorpayOrder
      builder
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to start payment";
      })

      // verifyRazorpayPayment
      builder
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.booking || null;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to verify payment";
      });
  },
});

export const { clearBookingState, clearBookingList } = bookingSlice.actions;
export default bookingSlice.reducer;
