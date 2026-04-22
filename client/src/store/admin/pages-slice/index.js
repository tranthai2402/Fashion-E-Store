import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  pageList: [],
  currentPageData: null,
};

export const savePage = createAsyncThunk(
  "/pages/savePage",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5000/api/admin/pages/save",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return result?.data;
  }
);

export const fetchAllPages = createAsyncThunk(
  "/pages/fetchAllPages",
  async () => {
    const result = await axios.get(
      "http://localhost:5000/api/admin/pages/get"
    );

    return result?.data;
  }
);

export const fetchPageBySlug = createAsyncThunk(
  "/pages/fetchPageBySlug",
  async (slug) => {
    const result = await axios.get(
      `http://localhost:5000/api/shop/pages/get/${slug}`
    );

    return result?.data;
  }
);

export const deletePage = createAsyncThunk(
  "/pages/deletePage",
  async (id) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/pages/delete/${id}`
    );

    return result?.data;
  }
);

const AdminPagesSlice = createSlice({
  name: "adminPages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllPages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pageList = action.payload?.data || [];
      })
      .addCase(fetchAllPages.rejected, (state) => {
        state.isLoading = false;
        state.pageList = [];
      })
      .addCase(fetchPageBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPageBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPageData = action.payload?.data || null;
      })
      .addCase(fetchPageBySlug.rejected, (state) => {
        state.isLoading = false;
        state.currentPageData = null;
      });
  },
});

export default AdminPagesSlice.reducer;
