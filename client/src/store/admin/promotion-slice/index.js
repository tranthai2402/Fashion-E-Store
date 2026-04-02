import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  promotions: [],
  selectedPromotion: null,
};

export const createPromotion = createAsyncThunk(
  "/admin/promotions/createPromotion",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5000/api/admin/promotions/create",
      formData,
      {
        withCredentials: true,
      }
    );
    return result?.data;
  }
);

export const fetchAllPromotions = createAsyncThunk(
  "/admin/promotions/fetchAllPromotions",
  async () => {
    const result = await axios.get(
      "http://localhost:5000/api/admin/promotions/get",
      {
        withCredentials: true,
      }
    );
    return result?.data;
  }
);

export const updatePromotion = createAsyncThunk(
  "/admin/promotions/updatePromotion",
  async ({ id, formData }) => {
    const result = await axios.put(
      `http://localhost:5000/api/admin/promotions/update/${id}`,
      formData,
      {
        withCredentials: true,
      }
    );
    return result?.data;
  }
);

export const deletePromotion = createAsyncThunk(
  "/admin/promotions/deletePromotion",
  async (id) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/promotions/delete/${id}`,
      {
        withCredentials: true,
      }
    );
    return result?.data;
  }
);

export const fetchPromotionDetails = createAsyncThunk(
  "/admin/promotions/fetchPromotionDetails",
  async (id) => {
    const result = await axios.get(
      `http://localhost:5000/api/admin/promotions/get/${id}`,
      {
        withCredentials: true,
      }
    );
    return result?.data;
  }
);

export const createVoucher = createAsyncThunk(
  "/admin/promotions/createVoucher",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5000/api/admin/promotions/voucher/create",
      formData,
      {
        withCredentials: true,
      }
    );
    return result?.data;
  }
);

const adminPromotionSlice = createSlice({
  name: "adminPromotions",
  initialState,
  reducers: {
    resetSelectedPromotion: (state) => {
      state.selectedPromotion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPromotions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllPromotions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.promotions = action.payload.data;
      })
      .addCase(fetchAllPromotions.rejected, (state, action) => {
        state.isLoading = false;
        state.promotions = [];
      })
      .addCase(fetchPromotionDetails.fulfilled, (state, action) => {
        state.selectedPromotion = action.payload.data;
      });
  },
});

export const { resetSelectedPromotion } = adminPromotionSlice.actions;
export default adminPromotionSlice.reducer;
