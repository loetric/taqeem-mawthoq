export type LoyaltyBadge = 
  | 'bronze'      // 0-99 points
  | 'silver'      // 100-299 points
  | 'gold'        // 300-599 points
  | 'platinum'    // 600-999 points
  | 'diamond'     // 1000+ points
  | 'expert';     // Special badge for expert reviewers

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user';
  loyaltyPoints: number;
  loyaltyBadge?: LoyaltyBadge; // Badge based on loyalty points
  avatar?: string;
  bio?: string;
  gender?: 'male' | 'female';
  location?: {
    lat: number;
    lng: number;
    city?: string;
  };
  preferences?: {
    categories: string[];
  };
  verifiedBadge?: boolean; // Special verification mark for expert reviewers
  createdAt: Date;
}

export type PlaceType = 'restaurant' | 'cafe' | 'shopping' | 'entertainment' | 'hotel' | 'beauty' | 'fitness' | 'medical' | 'school' | 'hospital' | 'other';

export interface Place {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  placeType: PlaceType;
  googleMapsUrl: string;
  phone?: string;
  whatsapp?: string; // WhatsApp number
  address?: string;
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
  };
  isClaimed: boolean;
  verified: boolean;
  verifiedBy?: string; // Who verified it (admin/system)
  hours?: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  ownerResponse?: {
    text: string;
    respondedAt: Date;
  };
  integrityScore?: number; // Review integrity/warranty score (0-100)
  verified: boolean; // Platform warranty verification
  flagged?: boolean; // If review is flagged for review
  likes?: string[]; // User IDs who liked this review
  reports?: number; // Number of reports
  isExpert?: boolean; // Expert reviewer badge
  createdAt: Date;
  // Additional review details
  reviewDetails?: {
    priceRange?: 'very_cheap' | 'cheap' | 'moderate' | 'expensive' | 'very_expensive';
    parking?: 'easy' | 'moderate' | 'difficult' | 'not_available';
    waitTime?: 'none' | 'short' | 'moderate' | 'long' | 'very_long';
    cleanliness?: 'excellent' | 'good' | 'average' | 'poor';
    service?: 'excellent' | 'good' | 'average' | 'poor';
    accessibility?: 'excellent' | 'good' | 'average' | 'poor';
    wifi?: 'excellent' | 'good' | 'average' | 'poor' | 'not_available';
    atmosphere?: 'excellent' | 'good' | 'average' | 'poor';
    valueForMoney?: 'excellent' | 'good' | 'average' | 'poor';
    recommendToFriend?: boolean;
    visitAgain?: boolean;
  };
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'review' | 'response' | 'question' | 'answer' | 'like' | 'report' | 'announcement' | 'loyalty' | 'badge' | 'system' | 'new_review_on_liked_place' | 'new_question_on_owned_place';
  title: string;
  message: string;
  placeId?: string;
  reviewId?: string;
  questionId?: string;
  answerId?: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string; // URL to navigate when clicked
}

export interface Question {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  question: string;
  answers: Answer[];
  createdAt: Date;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  answer: string;
  isOwner: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
}

export interface Announcement {
  id: string;
  placeId: string;
  title: string;
  content: string;
  type: 'announcement' | 'offer' | 'event';
  imageUrl?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface Inquiry {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  subject: string;
  message: string;
  status: 'pending' | 'answered' | 'closed';
  ownerResponse?: {
    text: string;
    respondedAt: Date;
  };
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  placeId?: string; // If null, applies to all user's places
  plan: 'basic' | 'premium' | 'enterprise';
  features: SubscriptionFeature[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface SubscriptionFeature {
  type: 'targeted_notifications' | 'analytics' | 'priority_support' | 'custom_branding';
  enabled: boolean;
  settings?: {
    maxNotificationsPerMonth?: number;
    targetCriteria?: NotificationCriteria;
  };
}

export interface NotificationCriteria {
  radius?: number; // in km
  gender?: 'male' | 'female' | 'all';
  ageRange?: {
    min: number;
    max: number;
  };
  interests?: string[]; // categories
  loyaltyLevel?: number; // minimum loyalty level
  location?: {
    lat: number;
    lng: number;
  };
}

