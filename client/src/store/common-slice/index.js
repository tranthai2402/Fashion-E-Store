import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
  headerTextColor: "white",
};

export const getFeatureImages = createAsyncThunk(
  "/order/getFeatureImages",
  async () => {
    const response = await axios.get(
      `http://localhost:5000/api/common/feature/get`
    );

    return response.data;
  }
);

export const addFeatureImage = createAsyncThunk(
  "/order/addFeatureImage",
  async ({ image, lookbookId }) => {
    const response = await axios.post(
      `http://localhost:5000/api/common/feature/add`,
      { image, lookbookId }
    );

    return response.data;
  }
);

export const updateFeatureImage = createAsyncThunk(
  "/order/updateFeatureImage",
  async ({ id, image, enabled, lookbookId }) => {
    const response = await axios.put(
      `http://localhost:5000/api/common/feature/update/${id}`,
      { image, enabled, lookbookId }
    );

    return response.data;
  }
);

export const deleteFeatureImage = createAsyncThunk(
  "/order/deleteFeatureImage",
  async (id) => {
    const response = await axios.delete(
      `http://localhost:5000/api/common/feature/delete/${id}`
    );

    return response.data;
  }
);

export const updateFeatureImageStatus = createAsyncThunk(
  "/order/updateFeatureImageStatus",
  async ({ id, enabled }) => {
    const response = await axios.patch(
      `http://localhost:5000/api/common/feature/update-status/${id}`,
      { enabled }
    );

    return response.data;
  }
);

export const reorderFeatureImages = createAsyncThunk(
  "/order/reorderFeatureImages",
  async (items) => {
    const response = await axios.put(
      `http://localhost:5000/api/common/feature/reorder`,
      { items }
    );

    return response.data;
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {
    setHeaderTextColor: (state, action) => {
      state.headerTextColor = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      })
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addFeatureImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addFeatureImage.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFeatureImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteFeatureImage.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateFeatureImageStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateFeatureImageStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.featureImageList.findIndex(
          (item) => item._id === action.payload.data._id
        );
        if (index !== -1) {
          state.featureImageList[index] = action.payload.data;
        }
      })
      .addCase(updateFeatureImageStatus.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(reorderFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(reorderFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(reorderFeatureImages.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.featureImageList.findIndex(
          (item) => item._id === action.payload.data._id
        );
        if (index !== -1) {
          state.featureImageList[index] = action.payload.data;
        }
      })
      .addCase(updateFeatureImage.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setHeaderTextColor } = commonSlice.actions;

export default commonSlice.reducer;
