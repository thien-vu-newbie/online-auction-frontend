import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, RegisterFormData } from '@/types';
import { tokenStorage } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // Registration flow
  registrationStep: 'form' | 'otp' | 'success';
  pendingRegistration: RegisterFormData | null;
  otpExpiresAt: number | null;
  otpResendCooldown: number;
}

// Restore auth state from localStorage
const getInitialState = (): AuthState => {
  const storedUser = tokenStorage.getUser();
  const accessToken = tokenStorage.getAccessToken();
  
  // Only restore if both user and token exist
  if (storedUser && accessToken) {
    return {
      user: storedUser,
      isAuthenticated: true,
      loading: false,
      error: null,
      registrationStep: 'form',
      pendingRegistration: null,
      otpExpiresAt: null,
      otpResendCooldown: 0,
    };
  }

  return {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    registrationStep: 'form',
    pendingRegistration: null,
    otpExpiresAt: null,
    otpResendCooldown: 0,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.registrationStep = 'form';
      state.pendingRegistration = null;
    },
    // Registration flow actions
    startRegistration: (state, action: PayloadAction<RegisterFormData>) => {
      state.pendingRegistration = action.payload;
      state.registrationStep = 'otp';
      state.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      state.otpResendCooldown = 60; // 60 seconds cooldown
      state.error = null;
    },
    verifyOtpSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.registrationStep = 'success';
      state.pendingRegistration = null;
      state.otpExpiresAt = null;
    },
    resetRegistration: (state) => {
      state.registrationStep = 'form';
      state.pendingRegistration = null;
      state.otpExpiresAt = null;
      state.error = null;
    },
    setOtpResendCooldown: (state, action: PayloadAction<number>) => {
      state.otpResendCooldown = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setUser,
  logout,
  startRegistration,
  verifyOtpSuccess,
  resetRegistration,
  setOtpResendCooldown,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
