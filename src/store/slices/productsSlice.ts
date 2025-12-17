import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types';

// Note: Product data is now fetched via React Query hooks (useProducts.ts)
// This slice is kept for legacy compatibility and potential future state needs

interface ProductsState {
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  currentProduct: null,
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setCurrentProduct,
} = productsSlice.actions;

export default productsSlice.reducer;
