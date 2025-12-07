// booking-history.interface.ts

export type BookingStatus = 
  | 'all' 
  | 'pending' 
  | 'accepted' 
  | 'in-progress' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled' 
  | 'active';

export interface PickupDetails {
  station: string;
  coachNumber: string;
  description: string;
}

export interface Timestamp {
  bookedAt: string;
  acceptedAt: string | null;
  pickupTime: string | null;
  completedAt: string | null;
}

export interface Fare {
  baseFare: string;
  waitingTime: string;
  waitingCharges: string;
  totalFare: string;
}

export interface Passenger {
  _id: string;
  name: string;
  mobileNo: string;
  emailId: string;
}

export interface Collie {
  _id?: string;
  name?: string;
  mobileNo?: string;
  emailId?: string;
  buckleNumber:string;
  rating:number
}

export interface Booking {
  _id: string;
  otp: string;
  status: string;
  pickupDetails: PickupDetails;
  destination: string;
  timestamp: Timestamp;
  fare: Fare;
  rating: number | null;
  feedback: string;
  complaint: string;
  createdAt: string;
  updatedAt: string;
  bookingId: string;
  passenger: Passenger;
  collie: Collie;
  duration: string | null;
}

export interface BookingHistoryData {
  bookings: Booking[];
  totalBookings: number;
  totalPages: number;
  currentPage: number;
Object:any;
 pagination: {
    totalBookings: number;
  };
  statistics: any;

}

export interface BookingHistoryResponse {
  status: number;
  message: string;
  data: BookingHistoryData;
}

export interface BookingHistoryRequest {
  page: number;
  limit: number;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}