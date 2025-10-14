// User Types
export type UserType = 'customer' | 'barber';

export interface User {
  id: string;
  type: UserType;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
}

// Barber Types
export interface Barber {
  id: string;
  userId: string;
  shopName: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  contact: string;
  workingHours: {
    open: string;
    close: string;
  };
  images: string[];
  rating: number;
  totalRatings: number;
  createdAt: Date;
}

// Service Types
export interface Service {
  id: string;
  barberId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string;
  active: boolean;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
}

// Favorite Types
export interface Favorite {
  id: string;
  customerId: string;
  barberId: string;
  createdAt: Date;
}

// Auth Context Types
export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string, phone: string, type: UserType) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Form Types
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  type: UserType;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Firebase Config
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Page Props
export interface PageProps {
  title: string;
  description?: string;
}
