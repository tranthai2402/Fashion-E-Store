import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiUrl } from "@/config/api";

const initialState = {
  isLoading: false,
  isSaving: false,
  homeVideos: [],
  aboutVideo: {
    sourceType: "youtube",
    url: "",
  },
};

export const fetchAdminVideoSettings = createAsyncThunk(
  "/admin/videos/fetchAdminVideoSettings",
  async () => {
    const response = await axios.get(getApiUrl("/api/admin/videos/get"), {
      withCredentials: true,
    });
    return response.data;
  }
);

export const updateAdminHomeVideos = createAsyncThunk(
  "/admin/videos/updateAdminHomeVideos",
  async (videos) => {
    const response = await axios.put(
      getApiUrl("/api/admin/videos/home"),
      { videos },
      { withCredentials: true }
    );
    return response.data;
  }
);

export const updateAdminAboutVideo = createAsyncThunk(
  "/admin/videos/updateAdminAboutVideo",
  async (payload) => {
    const response = await axios.put(
      getApiUrl("/api/admin/videos/about"),
      payload,
      { withCredentials: true }
    );
    return response.data;
  }
);

const adminVideoSlice = createSlice({
  name: "adminVideo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminVideoSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminVideoSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.homeVideos = action?.payload?.data?.homeVideos || [];
        state.aboutVideo = action?.payload?.data?.aboutVideo || {
          sourceType: "youtube",
          url: "",
        };
      })
      .addCase(fetchAdminVideoSettings.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateAdminHomeVideos.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateAdminHomeVideos.fulfilled, (state, action) => {
        state.isSaving = false;
        state.homeVideos = action?.payload?.data?.homeVideos || state.homeVideos;
      })
      .addCase(updateAdminHomeVideos.rejected, (state) => {
        state.isSaving = false;
      })
      .addCase(updateAdminAboutVideo.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateAdminAboutVideo.fulfilled, (state, action) => {
        state.isSaving = false;
        state.aboutVideo = action?.payload?.data?.aboutVideo || state.aboutVideo;
      })
      .addCase(updateAdminAboutVideo.rejected, (state) => {
        state.isSaving = false;
      });
  },
});

export default adminVideoSlice.reducer;
