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
  categoryId: string;
  categoryName: string;
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
  name: string;
  email: string;
  role: UserRole;
  rating: number;
  totalRatings: number;
  positiveRatings: number;
  avatar?: string;
  createdAt: string;
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
