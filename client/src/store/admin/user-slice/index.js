import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "@/config/api";

const initialState = {
  isLoading: false,
  userList: [],
};

export const fetchAllUsers = createAsyncThunk(
  "/admin/fetchAllUsers",
  async () => {
    const response = await axios.get(
      getApiUrl("/api/admin/users/get")
    );

    return response.data;
  }
);

export const updateUserRole = createAsyncThunk(
  "/admin/updateUserRole",
  async ({ userId, role }) => {
    const response = await axios.put(
      getApiUrl("/api/admin/users/update-role"),
      { userId, role }
    );

    return response.data;
  }
);

const adminUserSlice = createSlice({
  name: "adminUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userList = action.payload.data;
      })
      .addCase(fetchAllUsers.rejected, (state) => {
        state.isLoading = false;
        state.userList = [];
      });
  },
});

export default adminUserSlice.reducer;
