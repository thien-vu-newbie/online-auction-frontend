import { apiClient, tokenStorage } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  RegisterResponse,
  OtpResponse,
} from '@/types';

export const authApi = {
  /**
   * Register a new user account
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Verify OTP after registration
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', data);
    
    // Store tokens on successful verification
    if (response.data.access_token) {
      tokenStorage.setTokens(response.data.access_token, response.data.refresh_token);
    }
    
    return response.data;
  },

  /**
   * Resend OTP to email
   */
  resendOtp: async (data: ResendOtpRequest): Promise<OtpResponse> => {
    const response = await apiClient.post<OtpResponse>('/auth/resend-otp', data);
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Store tokens on successful login
    if (response.data.access_token) {
      tokenStorage.setTokens(response.data.access_token, response.data.refresh_token);
    }
    
    return response.data;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenStorage.clearTokens();
    }
  },

  /**
   * Request password reset OTP
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<OtpResponse> => {
    const response = await apiClient.post<OtpResponse>('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<OtpResponse> => {
    const response = await apiClient.post<OtpResponse>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl: (): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}/auth/google`;
  },
};
