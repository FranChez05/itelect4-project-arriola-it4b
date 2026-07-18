import {User, Court, Booking, BookingStatus, ApiResponse, UserUpdate, PublicUser,} from "../types/index.ts";

export function createUser(id: number): User {
  return {
    id,
    name: "Ana Arriola",
    email: "arriolaana@gmail.com",
    role: "player",
    isActive: true,
  };
}

export function createCourt(
  id: number,
  name: string,
  isAvailable: boolean
): Court {
  return {
    id,
    name,
    location: "Main Gym",
    isAvailable,
  };
}

export function createBooking(
  id: number,
  userId: number,
  courtId: number
): Booking {
  return {
    id,
    userId,
    courtId,
    bookingDate: new Date(),
    durationHours: 2,
    status: BookingStatus.Pending,
  };
}

//GENERIC FUNCTION
export function getById<T extends { id: number }>(
  items: T[],
  id: number
): T | undefined {
  return items.find((item) => item.id === id);
}

export const player = createUser(1);

export const courtA = createCourt(1, "Court A", true);
export const courtB = createCourt(2, "Court B", true);
export const courtC = createCourt(3, "Court C", false);

export const booking = createBooking(
  1,
  player.id,
  courtA.id
);

const courts = [courtA, courtB, courtC];
const bookings = [booking];

//GENERIC API RESPONSE
export const bookingResponse: ApiResponse<Booking[]> = {
  success: true,
  data: bookings,
  message: "Booking response loaded",
};

const updatedUser: UserUpdate = {
  name: "Ana Updated",
};

const publicPlayer: PublicUser = {
  id: player.id,
  name: player.name,
  role: player.role,
};

console.log("******* Welcome to Badminton Court Booking System *******");

console.log("\nPlayer");
console.log(player);
console.log("\nCourts");
console.log(courts);
console.log("\nBooking");
console.log(booking);
console.log("\nAPI Response");
console.log(bookingResponse);

console.log("\n*****`Badminton Court Booking System *****`");
console.log("\nUser Update");
console.log(updatedUser);
console.log("\nPublic User)");
console.log(publicPlayer);
console.log("Court:", courtA.name);
console.log("Booking status:", booking.status);
console.log("Lookup message:", bookingResponse.message);