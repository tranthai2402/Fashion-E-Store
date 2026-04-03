import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  isLoading: false,
  selectedItems: [],
  checkoutItems: [],
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/cart/add",
        {
          userId,
          productId,
          quantity,
          size,
          color,
        }
      );

      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async ({ userId, voucherCode, selectedItems }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/cart/get/${userId}`,
        {
          params: { voucherCode, selectedItems }
        }
      );

      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/shop/cart/${userId}/${productId}`,
        {
          params: { size, color },
        }
      );

      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/shop/cart/update-cart",
        {
          userId,
          productId,
          quantity,
          size,
          color,
        }
      );

      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      state.selectedItems = [];
    },
    toggleSelectItem: (state, action) => {
      const { id } = action.payload;
      if (!state.selectedItems) state.selectedItems = [];
      const index = state.selectedItems.indexOf(id);
      if (index === -1) {
        state.selectedItems.push(id);
      } else {
        state.selectedItems.splice(index, 1);
      }
    },
    selectAllItems: (state, action) => {
      state.selectedItems = action.payload;
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
    // New reducers for Checkout snapshot
    setCheckoutItems: (state, action) => {
      state.checkoutItems = action.payload;
    },
    toggleCheckoutSelectItem: (state, action) => {
      const { id } = action.payload;
      if (!state.checkoutItems) state.checkoutItems = [];
      const index = state.checkoutItems.indexOf(id);
      if (index === -1) {
        state.checkoutItems.push(id);
      } else {
        state.checkoutItems.splice(index, 1);
      }
    },
    selectAllCheckoutItems: (state, action) => {
      state.checkoutItems = action.payload;
    },
    clearCheckoutItems: (state) => {
      state.checkoutItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        // Don't clear cartItems on rejection
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
        // Don't clear cartItems on rejection
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
        // Don't clear cartItems on rejection
      });
  },
});

export const { 
  clearCart, toggleSelectItem, selectAllItems, clearSelectedItems, 
  setCheckoutItems, toggleCheckoutSelectItem, selectAllCheckoutItems, clearCheckoutItems 
} = shoppingCartSlice.actions;

export default shoppingCartSlice.reducer;
