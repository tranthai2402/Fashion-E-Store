import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  totalRevenue: 0,
  totalUsers: 0,
  totalOrdersCount: 0,
  chartData: [],
  comparisonData: null,
};

export const getRevenueAnalytics = createAsyncThunk(
  "/admin/getRevenueAnalytics",
  async (filter) => {
    const response = await axios.get(
      `http://localhost:5000/api/admin/analytics/revenue?filter=${filter}`
    );

    return response.data;
  }
);

export const getComparisonAnalytics = createAsyncThunk(
  "/admin/getComparisonAnalytics",
  async ({ period1, period2, type }) => {
    const response = await axios.get(
      `http://localhost:5000/api/admin/analytics/comparison?period1=${period1}&period2=${period2}&type=${type}`
    );

    return response.data;
  }
);

const adminAnalyticsSlice = createSlice({
  name: "adminAnalytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRevenueAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRevenueAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.totalRevenue = action.payload?.success ? action.payload?.data?.totalRevenue ?? 0 : 0;
        state.totalUsers = action.payload?.success ? action.payload?.data?.totalUsers ?? 0 : 0;
        state.totalOrdersCount = action.payload?.success ? action.payload?.data?.totalOrdersCount ?? 0 : 0;
        state.chartData = action.payload?.success ? action.payload?.data?.chartData ?? [] : [];
      })
      .addCase(getRevenueAnalytics.rejected, (state) => {
        state.isLoading = false;
        state.totalRevenue = 0;
        state.totalUsers = 0;
        state.totalOrdersCount = 0;
        state.chartData = [];
      })
      .addCase(getComparisonAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getComparisonAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comparisonData = action.payload?.success ? action.payload?.data ?? null : null;
      })
      .addCase(getComparisonAnalytics.rejected, (state) => {
        state.isLoading = false;
        state.comparisonData = null;
      });
  },
});

export default adminAnalyticsSlice.reducer;
