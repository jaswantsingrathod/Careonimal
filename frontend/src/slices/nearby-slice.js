import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios"; 
// Thunk: fetch providers from server
export const fetchNearbyProviders = createAsyncThunk(
  "nearby/fetchNearbyProviders",
  async ({ lat, lng, radiusKm }, { rejectWithValue }) => {
    try {
      const res = await axios.get("/providers/nearby", {
        params: { lat, lng, radius: radiusKm },
      });
      const json = res.data;
      const list = Array.isArray(json.providers) ? json.providers : [];

      // Normalize distances to km (server may use different fields)
      const normalized = list.map((p) => {
        const distance =
          p.distance != null
            ? Number(p.distance)
            : p.distanceKm != null
            ? Number(p.distanceKm)
            : p.distanceMeters != null
            ? Number((p.distanceMeters / 1000).toFixed(2))
            : null;
        return { ...p, distance };
      });

      return normalized;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Fetch failed");
    }
  }
);

const initialState = {
  providers: [],
  loadingProviders: false,
  searchingNearby: false,
  userCoords: null,
  qService: "",
  qCity: "",
  qPetType: "",
  radiusKm: 10,
  confirmOpen: false,
  error: null,
};

const slice = createSlice({
  name: "nearby",
  initialState,
  reducers: {
    setQService(state, action) {
      state.qService = action.payload;
    },
    setQPetType(state, action) {
      state.qPetType = action.payload;
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
    setLoadingProviders(state, action) {
      state.loadingProviders = action.payload;
    },
    applyClientFilters(state) {
      // In-place filtering: this keeps servers results but filters client-side
      const { qService, qCity, qPetType } = state;
      state.providers = state.providers.filter((p) => {
        if (qService && qService.trim() !== "" && p.serviceType !== qService) return false;
        if (qCity && qCity.trim() !== "") {
          const addr = (p.location?.address || "").toLowerCase();
          if (!addr.includes(qCity.toLowerCase())) return false;
        }
        if (qPetType && qPetType.trim() !== "") {
          const has = (p.servicesOffered || []).some(
            (s) => (s.petType || "").toLowerCase() === qPetType.toLowerCase()
          );
          if (!has) return false;
        }
        return true;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyProviders.pending, (state) => {
        state.loadingProviders = true;
        state.error = null;
      })
      .addCase(fetchNearbyProviders.fulfilled, (state, action) => {
        state.providers = action.payload || [];
        state.loadingProviders = false;
        state.searchingNearby = false;
        state.error = null;
      })
      .addCase(fetchNearbyProviders.rejected, (state, action) => {
        state.loadingProviders = false;
        state.searchingNearby = false;
        state.error = action.payload || "Failed to fetch";
      });
  },
});

export const {
  setQService,
  setQPetType,
  setRadiusKm,
  setConfirmOpen,
  setUserCoords,
  clearProviders,
  setSearchingNearby,
  setLoadingProviders,
  applyClientFilters,
} = slice.actions;

export default slice.reducer;
