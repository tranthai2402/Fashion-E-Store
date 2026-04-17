import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  bestSellingProducts: [],
  saleProducts: [],
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams }) => {
    console.log(fetchAllFilteredProducts, "fetchAllFilteredProducts");

    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
    });

    const result = await axios.get(
      `http://localhost:5000/api/shop/products/get?${query}`
    );

    console.log(result);

    return result?.data;
  }
);

export const fetchBestSellingProducts = createAsyncThunk(
  "/products/fetchBestSellingProducts",
  async (category) => {
    const query = category ? `?category=${category}` : "";
    const result = await axios.get(
      `http://localhost:5000/api/shop/products/best-selling${query}`
    );

    return result?.data;
  }
);

export const fetchSaleProducts = createAsyncThunk(
  "/products/fetchSaleProducts",
  async (category) => {
    const query = category ? `?category=${category}` : "";
    const result = await axios.get(
      `http://localhost:5000/api/shop/products/sale-products${query}`
    );

    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id) => {
    const result = await axios.get(
      `http://localhost:5000/api/shop/products/get/${id}`
    );

    return result?.data;
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchBestSellingProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBestSellingProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bestSellingProducts = action.payload.data;
      })
      .addCase(fetchBestSellingProducts.rejected, (state) => {
        state.isLoading = false;
        state.bestSellingProducts = [];
      })
      .addCase(fetchSaleProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSaleProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.saleProducts = action.payload.data;
      })
      .addCase(fetchSaleProducts.rejected, (state) => {
        state.isLoading = false;
        state.saleProducts = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
