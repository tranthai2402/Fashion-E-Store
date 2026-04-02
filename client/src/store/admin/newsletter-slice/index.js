import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  emailList: [],
};

export const fetchAllEmails = createAsyncThunk(
  "/newsletter/fetchAllEmails",
  async () => {
    const result = await axios.get(
      "http://localhost:5000/api/admin/newsletter/all-emails"
    );

    return result?.data;
  }
);

export const deleteSubscriber = createAsyncThunk(
  "/newsletter/deleteSubscriber",
  async (email) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/newsletter/subscriber/${email}`
    );

    return result?.data;
  }
);

const adminNewsletterSlice = createSlice({
  name: "adminNewsletterSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEmails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllEmails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emailList = action.payload.data;
      })
      .addCase(fetchAllEmails.rejected, (state) => {
        state.isLoading = false;
        state.emailList = [];
      });
  },
});

export default adminNewsletterSlice.reducer;
