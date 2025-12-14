import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const fetchMySubscription = createAsyncThunk(
  "subscription/fetchMySubscription",
  async (undefined, { rejectWithValue }) => {
    try {
      const res = await axios.get("/providers/my-subscription", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // no subscription yet -> not an error, just null
        return null;
      }
      return rejectWithValue(
        err.response?.data?.error ||
          err.message ||
          "Failed to load subscription"
      );
    }
  }
);

// export const buySubscription = createAsyncThunk(
//   "subscription/buySubscription",
//   async (planType, { rejectWithValue }) => {
//     try {
//       const res = await axios.post(
//         "/providers/subscription",
//         {planType},
//         { headers: { Authorization: localStorage.getItem("token") } }
//       );
//       console.log(res.data);
//       return res.data.subscription;
//     } catch (err) {
//         console.log(err);
//       return rejectWithValue(
//         err.response?.data?.error || "Failed to buy subscription"
//       );
//     }
//   }
// );

export const createSubscriptionOrder = createAsyncThunk(
  "subscription/createSubscriptionOrder",
  async (planType, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        "/providers/subscription/create-order",
        { planType },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      return res.data; 
    } catch (err) {
        console.log(err);
      return rejectWithValue(
        err.response?.data?.error || "Failed to create subscription order"
      );
    }
  }
);

//  verify payment & activate subscription
export const verifySubscriptionPayment = createAsyncThunk(
  "subscription/verifySubscriptionPayment",
  async (
    { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post(
        "/providers/subscription/verify-payment",
        {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          planType,
        },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      return res.data.subscription;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to verify subscription payment"
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    data: null,
    buying: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetch subscription cases
    builder
      .addCase(fetchMySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; 
      })
      .addCase(fetchMySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load subscription";
      });

      // buy subscription cases
     builder
      .addCase(createSubscriptionOrder.pending, (state) => {
        state.buying = true;
        state.error = null;
      })
      .addCase(createSubscriptionOrder.fulfilled, (state) => {
        state.buying = false;
      })
      .addCase(createSubscriptionOrder.rejected, (state, action) => {
        state.buying = false;
        state.error = action.payload 
      });

    // verify payment
    builder
      .addCase(verifySubscriptionPayment.pending, (state) => {
        state.buying = true;
        state.error = null;
      })
      .addCase(verifySubscriptionPayment.fulfilled, (state, action) => {
        state.buying = false;
        state.data = action.payload; 
      })
      .addCase(verifySubscriptionPayment.rejected, (state, action) => {
        state.buying = false;
        state.error = action.payload
      });
  },
});

export default subscriptionSlice.reducer;
