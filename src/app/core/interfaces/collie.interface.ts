// collie.interface.ts

export interface RateCard {
  baseRate: number;
  baseTime: number;
  waitingRate: number;
}

export interface CollieImage {
  url: string;
  s3Key: string;
}

export interface Collie {
  _id?: string;
  name: string;
  mobileNo: string;
  age: number;
  deviceType: 'SmartPhone' | 'Other';
  emailId?: string;
  gender: 'Male' | 'Female' | 'Other';
  buckleNumber: string;
  stationId: string | Station;
  address: string;
  image: CollieImage;
  faceEmbeddingId?: string;
  isApproved: boolean;
  isActive: boolean;
  isLoggedIn?: boolean;
  lastLoginTime?: string | null;
  fcm?: string;
  latitude?: number | null;
  longitude?: number | null;
  currentBookingId?: string | null;
  rateCard: RateCard;
  rating: number;
  totalRatings: number;
  completedBookings: number;
  rejectedBookings: number;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollieRegisterRequest {
  name: string;
  mobileNo: string;
  age: number;
  deviceType: 'SmartPhone' | 'Other';
  emailId?: string;
  gender: 'Male' | 'Female' | 'Other';
  buckleNumber: string;
  address: string;
  stationId: string;
  image?: File;
}

export interface CollieRegistrationResponse {
  collie: {
    _id: string;
    name: string;
    mobileNo: string;
    buckleNumber: string;
    stationId: string;
    isApproved: boolean;
    faceRegistered: boolean;
    faceEmbeddingId: string;
  };
  faceRegistration?: any;
  faceRegistrationError?: string;
}

export interface PendingApproval extends Collie {
  stationId: Station;
}

export interface UpdateRatesRequest {
  stationId: string;
  baseRate: number;
  baseTime: number;
  waitingRate: number;
}

export interface PerformanceReportItem {
  collieName: string;
  mobileNo: string;
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalWaitingTime: number;
}

export interface PerformanceReportRequest {
  startDate?: string;
  endDate?: string;
}

export interface CollieResponse {
  message: string;
  data: Collie | Collie[] | CollieRegistrationResponse | null;
  status: number;
}

export interface PendingApprovalsResponse {
  message: string;
  data: PendingApproval[];
  status: number;
}

export interface PerformanceReportResponse {
  message: string;
  data: PerformanceReportItem[];
  status: number;
}

// Station Interface (for reference in Collie)
export interface GeofenceConfig {
  geofenceType: 'circle' | 'polygon';
  area: number;
  vertices: number;
}

export interface Station {
  _id?: string;
  name: string;
  code: string;
  cityId: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadius?: number;
  geofencePolygon?: number[][][] | null;
  geofenceConfig: GeofenceConfig;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}