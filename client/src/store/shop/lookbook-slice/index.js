import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  lookbookList: [],
  lookbookDetails: null,
};

export const fetchLookbookList = createAsyncThunk(
  "/shop/lookbook/fetchList",
  async () => {
    const response = await axios.get("http://localhost:5000/api/shop/lookbook/get");
    return response.data;
  }
);

export const fetchLookbookDetails = createAsyncThunk(
  "/shop/lookbook/fetchDetails",
  async (id) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/lookbook/get/${id}`
    );
    return response.data;
  }
);

const shopLookbookSlice = createSlice({
  name: "shopLookbook",
  initialState,
  reducers: {
    resetLookbookDetails: (state) => {
      state.lookbookDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLookbookList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLookbookList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lookbookList = action.payload.data || [];
      })
      .addCase(fetchLookbookList.rejected, (state) => {
        state.isLoading = false;
        state.lookbookList = [];
      })
      .addCase(fetchLookbookDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLookbookDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lookbookDetails = action.payload.data || null;
      })
      .addCase(fetchLookbookDetails.rejected, (state) => {
        state.isLoading = false;
        state.lookbookDetails = null;
      });
  },
});

export const { resetLookbookDetails } = shopLookbookSlice.actions;

export default shopLookbookSlice.reducer;
