import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axios";

// Thunk: create a new provider
export const createProvider = createAsyncThunk(
  "provider/createProvider",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/providers/register", formData, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.error || err.message || "Create provider failed";
      console.error("createProvider error:", message);
      return rejectWithValue(message);
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
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.error || err.message || "Update provider failed";
      console.error("updateProvider error:", message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "provider/deleteAccount",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/provider/account/delete/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.error || err.message || "Delete account failed";
      console.error("deleteAccount error:", message);
      return rejectWithValue(message);
    }
  }
);

const providerSlice = createSlice({
  name: "provider",
  initialState: {
    provider: null,
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
    // createProvider
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

    // updateProvider
    builder
      .addCase(updateProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.provider = action.payload;
      })
      .addCase(updateProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update provider";
      });

    // deleteAccount
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.provider = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete your account";
      });
  },
});

/* Export provider actions + reducer */
export const { clearProviderState } = providerSlice.actions;
export const providerReducer = providerSlice.reducer;

const providerUiInitial = {
  // dialogs
  openLogo: false,
  openPersonal: false,
  openServices: false,
  deleteOpen: false,

  // personal fields
  businessName: "",
  contact: "",
  priceRange: "",

  // logo
  logoFile: null,
  logoPreview: null,

  // services (editable copy)
  servicesCopy: [],
};

const providerUiSlice = createSlice({
  name: "providerUi",
  initialState: providerUiInitial,
  reducers: {
    // dialog toggles
    setOpenLogo(state, action) {
      state.openLogo = action.payload;
    },
    setOpenPersonal(state, action) {
      state.openPersonal = action.payload;
    },
    setOpenServices(state, action) {
      state.openServices = action.payload;
    },
    setDeleteOpen(state, action) {
      state.deleteOpen = action.payload;
    },

    // personal fields
    setBusinessName(state, action) {
      state.businessName = action.payload;
    },
    setContact(state, action) {
      state.contact = action.payload;
    },
    setPriceRange(state, action) {
      state.priceRange = action.payload;
    },

    // logo
    setLogoFile(state, action) {
      state.logoFile = action.payload;
    },
    setLogoPreview(state, action) {
      state.logoPreview = action.payload;
    },
    clearLogo(state) {
      state.logoFile = null;
      state.logoPreview = null;
    },

    // services copy operations
    setServicesCopy(state, action) {
      state.servicesCopy = action.payload ?? [];
    },
    addPetType(state) {
      state.servicesCopy.push({
        petType: "",
        subServices: [{ service: "", description: "", price: "" }],
      });
    },
    removePetType(state, action) {
      const idx = action.payload;
      state.servicesCopy = state.servicesCopy.filter((_, i) => i !== idx);
    },
    setPetTypeField(state, action) {
      const { idx, value } = action.payload;
      if (!state.servicesCopy[idx]) return;
      state.servicesCopy[idx] = { ...state.servicesCopy[idx], petType: value };
    },
    addSubService(state, action) {
      const idx = action.payload;
      if (!state.servicesCopy[idx]) return;
      state.servicesCopy[idx].subServices = state.servicesCopy[idx].subServices || [];
      state.servicesCopy[idx].subServices.push({ service: "", description: "", price: "" });
    },
    removeSubService(state, action) {
      const { gIdx, sIdx } = action.payload;
      if (!state.servicesCopy[gIdx]?.subServices) return;
      state.servicesCopy[gIdx].subServices = state.servicesCopy[gIdx].subServices.filter((_, i) => i !== sIdx);
    },
    setSubField(state, action) {
      const { gIdx, sIdx, field, value } = action.payload;
      if (!state.servicesCopy[gIdx]?.subServices?.[sIdx]) return;
      state.servicesCopy[gIdx].subServices[sIdx] = {
        ...state.servicesCopy[gIdx].subServices[sIdx],
        [field]: value,
      };
    },

    // helpers to populate initial values from provider entity
    populateFromProvider(state, action) {
      const prov = action.payload || {};
      state.businessName = prov.businessName || "";
      state.contact = prov.contact || "";
      state.priceRange = prov.priceRange || "";
      state.logoPreview = prov.image || null;
      state.logoFile = null;
      state.servicesCopy = JSON.parse(JSON.stringify(prov.servicesOffered || []));
    },

    resetAll(state) {
      Object.assign(state, providerUiInitial);
    },
  },
});

/* Export UI actions + reducer */
export const {
  setOpenLogo,
  setOpenPersonal,
  setOpenServices,
  setDeleteOpen,
  setBusinessName,
  setContact,
  setPriceRange,
  setLogoFile,
  setLogoPreview,
  clearLogo,
  setServicesCopy,
  addPetType,
  removePetType,
  setPetTypeField,
  addSubService,
  removeSubService,
  setSubField,
  populateFromProvider,
  resetAll,
} = providerUiSlice.actions;

export const providerUiReducer = providerUiSlice.reducer;

export default {
  providerReducer,
  providerUiReducer,
};
