import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "@/config/api";

const initialState = {
  isLoading: false,
  homeVideos: [],
  aboutVideo: {
    sourceType: "youtube",
    url: "",
  },
};

export const fetchPublicVideoSettings = createAsyncThunk(
  "/common/videos/fetchPublicVideoSettings",
  async () => {
    const response = await axios.get(getApiUrl("/api/common/videos/get"));
    return response.data;
  }
);

const commonVideoSlice = createSlice({
  name: "commonVideo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicVideoSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPublicVideoSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.homeVideos = action?.payload?.data?.homeVideos || [];
        state.aboutVideo = action?.payload?.data?.aboutVideo || {
          sourceType: "youtube",
          url: "",
        };
      })
      .addCase(fetchPublicVideoSettings.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default commonVideoSlice.reducer;
