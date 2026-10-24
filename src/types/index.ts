export type UserRole = "player" | "admin";

//Regular enum
export enum BookingStatus {
  Pending = "pending",
  Approved = "approved",
  Declined = "declined",
  Cancelled = "cancelled",
  Completed = "completed",
}

//INTERFACES
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface Court {
  id: number;
  name: string;
  location: string;
  isAvailable: boolean;
  description?: string;
  imageUrl?: string;
  surface?: string;
  amenities?: string;
}

export interface Booking {
  id: number;
  userId: number;
  courtId: number;
  bookingDate: Date;
  durationHours: number;
  status: BookingStatus;
}

//GENERIC INTERFACE
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

//UTILITY TYPES
export type UserUpdate = Partial<User>;
export type PublicUser = Omit<User, "email" | "isActive">;

// API TYPES (JSON representations & creation payloads derived with Omit)
// JSON cannot represent JS Date objects, so bookingDate is string in raw JSON
export type ApiBooking = Omit<Booking, "bookingDate"> & {
  bookingDate: string;
};

// Payloads for creating entities (omitting server-generated id)
export type CreateCourtInput = Omit<Court, "id">;
export type CreateBookingInput = Omit<Booking, "id" | "bookingDate"> & {
  bookingDate: string | Date;
};
export type CreateUserInput = Omit<User, "id">;
export type AiReviewTopic = 'booking' | 'availability' | 'account' | 'admin' | 'mixed' | 'other'

export interface AiReviewAnswer {
  question: string
  answer: string
}

export interface AiReview {
  topic: AiReviewTopic
  answers: AiReviewAnswer[]
}
