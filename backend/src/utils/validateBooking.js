// backend/src/utils/validateBooking.js
import Booking from "../models/Booking.js";

export async function isRoomAvailable(roomId, date, startTime, endTime, excludeId = null) {
  return Booking.isRoomAvailable(roomId, date, startTime, endTime, excludeId);
}
