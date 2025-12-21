// Product Types
export interface Product {
  id: string;
  name: string;
  currentPrice: number;
  buyNowPrice?: number;
  startPrice: number;
  bidStep: number;
  imageUrl: string;
  images: string[];
  description: string;
  descriptionHistory?: Array<{
    _id: string;
    content: string;
    addedAt: string;
  }>;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  highestBidderId?: string;
  highestBidderName?: string;
  highestBidderRating?: number;
  bidCount: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  isNew?: boolean;
  autoExtend: boolean;
  isRejected?: boolean;
  isWinning?: boolean;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: Category[];
  icon?: string;
}

// User Types
export type UserRole = 'guest' | 'bidder' | 'seller' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  rating: number;
  totalRatings: number;
  positiveRatings: number;
  avatar?: string;
  isVerified: boolean;
  dateOfBirth?: string;
  address?: string;
  createdAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  address: string;
  dateOfBirth?: string;
  recaptchaToken: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Auth Response Types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface OtpResponse {
  message: string;
  email?: string;
}

// Form data types (for UI state)
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  dateOfBirth?: string;
}

// Bid Types
export interface Bid {
  id: string;
  productId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  createdAt: string;
}

// Rating Types
export interface Rating {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  isPositive: boolean;
  comment: string;
  createdAt: string;
}

// Q&A Types
export interface Question {
  id: string;
  productId: string;
  askerId: string;
  askerName: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
}
