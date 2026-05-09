import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import { sendEventStatusEmail } from "../utils/email.js";

export const bookEvent = async (req, res) => {
  const { eventId } = req.body;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }
    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      eventId,
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "You have already booked this event" });
    }
    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      amount: event.ticketPrice,
      paymentStatus: "unpaid",
      status: "pending",
    });
    return res
      .status(201)
      .json({ message: "Booking created. Proceed to payment", booking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Booking failed", error: error.message });
  }
};

export const confirmBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id).populate("eventId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status == "booked") {
      return res.status(400).json({ message: "Booking already confirmed" });
    }
    if (booking.eventId.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "booked",
        paymentStatus: "paid",
      },
      { new: true },
    );
    await Event.findByIdAndUpdate(booking.eventId._id, {
      $inc: { availableSeats: -1 },
    });
    await sendEventStatusEmail(
      req.user.email,
      booking.eventId.name,
      "booking_success",
    );
    return res
      .status(200)
      .json({ message: "Booking confirmed successfully", updatedBooking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to confirm booking", error: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate(
      "eventId",
    );
    return res.status(200).json({ bookings });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id).populate("eventId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status == "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {  
        status: "cancelled",
      },
      { new: true },
    );
    if (booking.status === "booked") {
      await Event.findByIdAndUpdate(booking.eventId._id, {
        $inc: { availableSeats: 1 },
      });
    }

    await sendEventStatusEmail(
      req.user.email,
      booking.eventId.name,
      "booking_cancelled",
    );
    return res
      .status(200)
      .json({ message: "Booking cancelled successfully", updatedBooking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to cancel booking", error: error.message });
  }
};
