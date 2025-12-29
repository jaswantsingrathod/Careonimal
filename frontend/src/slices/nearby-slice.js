import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios";

// Thunk
export const fetchNearbyProviders = createAsyncThunk(
  "nearby/fetchNearbyProviders",
  async (
    { lat, lng, radiusKm, serviceType, petType },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.get("/providers/nearby", {
        params: {
          lat,
          lng,
          radius: radiusKm,
          serviceType,
          petType,
        },
      });

      const list = Array.isArray(res.data?.providers)
        ? res.data.providers
        : [];

      const normalized = list.map((p) => ({
        ...p,
        distance: p.distance != null ? Number(p.distance) : null,
      }));

      return normalized;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message || "Fetch failed"
      );
    }
  }
);

// INITIAL STATE 
const initialState = {
  providers: [],
  loading: false,
  searchingNearby: false,
  userCoords: null,
  serviceType: "",
  petType: "",
  radiusKm: 10,
  confirmOpen: false,
  error: null,
};

// SLICE
const slice = createSlice({
  name: "nearby",
  initialState,
  reducers: {
    setServiceType(state, action) {
      state.serviceType = action.payload;
    },
    setPetType(state, action) {
      state.petType = action.payload;
    },
    setRadiusKm(state, action) {
      state.radiusKm = action.payload;
    },
    setConfirmOpen(state, action) {
      state.confirmOpen = action.payload;
    },
    setUserCoords(state, action) {
      state.userCoords = action.payload;
    },
    clearProviders(state) {
      state.providers = [];
    },
    setSearchingNearby(state, action) {
      state.searchingNearby = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyProviders.fulfilled, (state, action) => {
        state.providers = action.payload;
        state.loading = false;
        state.searchingNearby = false;
      })
      .addCase(fetchNearbyProviders.rejected, (state, action) => {
        state.loading = false;
        state.searchingNearby = false;
        state.error = action.payload || "Failed to fetch";
      });
  },
});

export const {
  setServiceType,
  setPetType,
  setRadiusKm,
  setConfirmOpen,
  setUserCoords,
  clearProviders,
  setSearchingNearby,
} = slice.actions;

export default slice.reducer;
