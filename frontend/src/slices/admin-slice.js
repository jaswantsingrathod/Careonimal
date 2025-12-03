import axios from "../config/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/* ---------- THUNKS ---------- */

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (undefined, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/users`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      // console.log("users-s", res.data);
      return res.data;
    } catch (err) {
      console.log("error", err);
      return rejectWithValue(
        err?.response?.data?.error || "Failed to fetch users"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      // console.log("id:", id);
      const res = await axios.delete(`/user/account/delete/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      console.log("User deleted:", res.data);
      return res.data; 
    } catch (err) {
      console.error("Delete user error:", err);
      return rejectWithValue(
        err?.response?.data?.error || "Failed to delete user"
      );
    }
  }
);

export const fetchSingleUser = createAsyncThunk(
  "admin/fetchSingleUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/users/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      // console.log("view", res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err?.response?.data?.error || "Failed to view");
    }
  }
);

export const fetchProvider = createAsyncThunk(
  "admin/fetchProvider",
  async (undefined, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/providers`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      console.log(err.response.data.error);
      return rejectWithValue(err.response.data.error);
    }
  }
);

export const fetchSingleProvider = createAsyncThunk(
  "admin/fetchSingleProvider",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/providers/${id}`)
      console.log(res.data);
      return res.data;
    } catch (err) {
      console.log(err.response.data.error);
      return rejectWithValue(err.response.data.error);
    }
  }
);

export const approveProvider = createAsyncThunk(
  "admin/approveProvider",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `/provider/approve/${id}`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      console.log("update", res.data);
      return res.data;
    } catch (err) {
      console.log("Error:", err.response.data.error);
      return rejectWithValue(err.response.data.error);
    }
  }
);


const normalizeUsers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

/* ---------- SLICE ---------- */

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    providers: [],
    loading: false,
    error: null,
    approving: false,
    selectedUser: null,
    isUserViewOpen: false,
    selectedProvider: null,
  },
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
    setSelectedProvider(state, action) {
      state.selectedProvider = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = normalizeUsers(action.payload); // always an array
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // deleteUser
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.meta.arg; // the id you passed into dispatch(deleteUser(id))
        state.users = state.users.filter((ele) => ele._id !== deletedId);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // View Users
    builder
      .addCase(fetchSingleUser.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(fetchSingleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload; // use this in your modal
        state.isUserViewOpen = true;
      })
      .addCase(fetchSingleUser.rejected, (state, action) => {
        (state.loading = false), (state.error = action.payload);
      });

    // fetch Providers
    builder
      .addCase(fetchProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.providers ?? [];
      })
      .addCase(fetchProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // View Provider
    builder
      .addCase(fetchSingleProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProvider = action.payload;
      })
      .addCase(fetchSingleProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Approve Provider
    builder
      .addCase(approveProvider.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(approveProvider.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.provider ?? action.payload ?? null;
        state.approving = false;
        if (updated && updated._id) {
          state.providers = state.providers.map((p) =>
            p._id === updated._id ? updated : p
          );
          if (state.selectedProvider?._id === updated._id) {
            state.selectedProvider = updated;
          }
        }
      })
      .addCase(approveProvider.rejected, (state, action) => {
        (state.loading = false), (state.error = action.payload);
      });
  },
});

export const { clearAdminError, setSelectedProvider } = adminSlice.actions;
export default adminSlice.reducer;
