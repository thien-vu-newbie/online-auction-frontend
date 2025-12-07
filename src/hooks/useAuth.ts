import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage, tokenStorage } from '@/lib/api/client';
import { useAppDispatch } from '@/store/hooks';
import {
  setUser,
  setLoading,
  setError,
  logout as logoutAction,
  startRegistration,
  verifyOtpSuccess,
  setOtpResendCooldown,
  clearError,
} from '@/store/slices/authSlice';
import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  User,
} from '@/types';

// Helper to convert fullName to firstName/lastName
const parseFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] };
  }
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
};

// Helper to convert API user to app User type
const mapApiUserToUser = (apiUser: { id: string; email: string; fullName: string; role: string }): User => {
  const { firstName, lastName } = parseFullName(apiUser.fullName);
  return {
    id: apiUser.id,
    firstName,
    lastName,
    email: apiUser.email,
    role: apiUser.role as User['role'],
    rating: 0,
    totalRatings: 0,
    positiveRatings: 0,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Hook for user login
 */
export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (response) => {
      const user = mapApiUserToUser(response.user);
      // Save user to localStorage for persistence
      tokenStorage.setUser(user);
      dispatch(setUser(user));
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/');
    },
    onError: (error) => {
      dispatch(setError(getErrorMessage(error)));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
}

/**
 * Hook for user registration
 */
export function useRegister() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (_response, variables) => {
      // Move to OTP verification step
      // Store form data for potential resend
      const { firstName, lastName } = parseFullName(variables.fullName);
      dispatch(startRegistration({
        firstName,
        lastName,
        email: variables.email,
        password: variables.password,
        confirmPassword: variables.password,
        address: variables.address,
        dateOfBirth: variables.dateOfBirth,
      }));
    },
    onError: (error) => {
      dispatch(setError(getErrorMessage(error)));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
}

/**
 * Hook for OTP verification
 */
export function useVerifyOtp() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authApi.verifyOtp(data),
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (response) => {
      const user = mapApiUserToUser(response.user);
      // Save user to localStorage for persistence
      tokenStorage.setUser(user);
      dispatch(verifyOtpSuccess(user));
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Short delay to show success message before redirect
      setTimeout(() => navigate('/'), 2000);
    },
    onError: (error) => {
      dispatch(setError(getErrorMessage(error)));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
}

/**
 * Hook for resending OTP
 */
export function useResendOtp() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: ResendOtpRequest) => authApi.resendOtp(data),
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: () => {
      dispatch(setOtpResendCooldown(60)); // 60 seconds cooldown
    },
    onError: (error) => {
      dispatch(setError(getErrorMessage(error)));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      dispatch(logoutAction());
      queryClient.clear();
      navigate('/login');
    },
    onError: () => {
      // Even if API fails, clear local state
      dispatch(logoutAction());
      tokenStorage.clearTokens();
      queryClient.clear();
      navigate('/login');
    },
  });
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword({ email }),
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onError: (error) => {
      dispatch(setError(getErrorMessage(error)));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
}

/**
 * Hook for reset password
 */
export function useResetPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email: string; otp: string; newPassword: string }) =>
      authApi.resetPassword(data),
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: () => {
      navigate('/login');
    },
    onError: (error) => {
      dispatch(setError(getErrorMessage(error)));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });
}

/**
 * Helper hook to get Google auth URL
 */
export function useGoogleAuth() {
  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  return { handleGoogleLogin };
}
