import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  lookbookList: [],
};

export const fetchAllLookbooksAdmin = createAsyncThunk(
  "/admin/lookbook/fetchAll",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/admin/lookbook/get",
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const addNewLookbook = createAsyncThunk(
  "/admin/lookbook/add",
  async (payload) => {
    const response = await axios.post(
      "http://localhost:5000/api/admin/lookbook/add",
      payload,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const deleteLookbook = createAsyncThunk(
  "/admin/lookbook/delete",
  async (id) => {
    const response = await axios.delete(
      `http://localhost:5000/api/admin/lookbook/delete/${id}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

const adminLookbookSlice = createSlice({
  name: "adminLookbook",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLookbooksAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllLookbooksAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lookbookList = action.payload.data || [];
      })
      .addCase(fetchAllLookbooksAdmin.rejected, (state) => {
        state.isLoading = false;
        state.lookbookList = [];
      })
      .addCase(addNewLookbook.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewLookbook.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addNewLookbook.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteLookbook.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteLookbook.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteLookbook.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default adminLookbookSlice.reducer;
