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
      return res.data; // just message / deleted user, not list

    } catch (err) {
      console.error("Delete user error:", err);
      return rejectWithValue(
        err?.response?.data?.error || "Failed to delete user"
      );
    }
  }
);

export const fetchSingleUser = createAsyncThunk(
  "admin/fetchSingleUser", async (id, {rejectWithValue}) => {
    try{
      const res = await axios.get(`/users/${id}`, {headers: {Authorization: localStorage.getItem("token")}})
      console.log("view",res.data);
      return res.data
    }catch(err){
      console.log(err);
      return rejectWithValue(err?.response?.data?.error || "Failed to view")
    }
  }
)

/* ---------- HELPERS ---------- */

const normalizeUsers = (payload) => {
  // API returns an array directly: [ {...}, {...} ]
  if (Array.isArray(payload)) return payload;

  // API returns { users: [ ... ] }
  if (Array.isArray(payload?.users)) return payload.users;

  // API returns { data: [ ... ] }
  if (Array.isArray(payload?.data)) return payload.data;

  // Fallback: nothing usable
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
    isUserViewOpen: false
  },
  reducers: {
    clearAdminError(state) {
      state.error = null;
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
        state.loading = true,
        state.error = null
      }) 
      .addCase(fetchSingleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;  // use this in your modal
        state.isUserViewOpen = true;
      })
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
