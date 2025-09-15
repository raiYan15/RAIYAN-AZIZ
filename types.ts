export enum ServiceType {
  SHOP = 'Shop',
  RESTAURANT = 'Restaurant',
  HOMESTAY = 'Homestay',
  GUIDE = 'Guide Service',
  TRANSPORT = 'Transport',
  OTHER = 'Other',
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface ServiceProvider {
  id: string;
  businessName: string;
  serviceType: ServiceType;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  shortDescription: string;
  workingHours: string;
  priceRange: string;
  profilePhotoUrl: string;
}

export interface Booking {
  id: string;
  touristName: string;
  touristAvatar: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  isNew?: boolean;
}

export interface Message {
  id: string;
  touristName: string;
  touristAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isNew?: boolean;
}

export interface ConversationMessage {
  id: string;
  sender: 'provider' | 'tourist';
  text: string;
  timestamp: string;
}

export interface MonthlyAnalytics {
  month: string;
  visitors: number;
  revenue: number;
}

export interface HourlyAnalytics {
    hour: string;
    bookings: number;
}

export interface Theme {
  name: ServiceType;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  textOnPrimary: string;
  backgroundUrl: string;
  icon: JSX.Element;
}