import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '@/types';
import { mockCategories } from '@/data/mockData';

interface CategoriesState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: mockCategories,
  currentCategory: null,
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setCategories,
  setCurrentCategory,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
