import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types';
import { 
  mockProducts, 
  getEndingSoonProducts, 
  getMostBidsProducts, 
  getHighestPriceProducts 
} from '@/data/mockData';

interface ProductsState {
  allProducts: Product[];
  endingSoon: Product[];
  mostBids: Product[];
  highestPrice: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  allProducts: mockProducts,
  endingSoon: getEndingSoonProducts(5),
  mostBids: getMostBidsProducts(5),
  highestPrice: getHighestPriceProducts(5),
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
    setAllProducts: (state, action: PayloadAction<Product[]>) => {
      state.allProducts = action.payload;
    },
    setEndingSoon: (state, action: PayloadAction<Product[]>) => {
      state.endingSoon = action.payload;
    },
    setMostBids: (state, action: PayloadAction<Product[]>) => {
      state.mostBids = action.payload;
    },
    setHighestPrice: (state, action: PayloadAction<Product[]>) => {
      state.highestPrice = action.payload;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    updateProductPrice: (state, action: PayloadAction<{ id: string; price: number; bidCount: number }>) => {
      const { id, price, bidCount } = action.payload;
      const product = state.allProducts.find(p => p.id === id);
      if (product) {
        product.currentPrice = price;
        product.bidCount = bidCount;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setAllProducts,
  setEndingSoon,
  setMostBids,
  setHighestPrice,
  setCurrentProduct,
  updateProductPrice,
} = productsSlice.actions;

export default productsSlice.reducer;
