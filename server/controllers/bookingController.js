import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { sendEventStatusEmail } from "../utils/email.js";

export const bookEvent = async (req, res) => {
  const { eventId } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({
        message: "No seats available",
      });
    }

    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      eventId,
    });

    if (existingBooking) {
      if (existingBooking.status === "booked") {
        return res.status(400).json({
          message: "You have already booked this event",
        });
      }

      if (existingBooking.status === "pending") {
        return res.status(200).json({
          message: "Existing pending booking found. Proceeding to payment gateway...",
          booking: existingBooking,
        });
      }

      const reactivatedBooking = await Booking.findByIdAndUpdate(
        existingBooking._id,
        {
          amount: event.ticketPrice,
          paymentStatus: "unpaid",
          status: "pending",
        },
        { new: true },
      );

      return res.status(200).json({
        message: "Booking restarted. Proceeding to payment gateway...",
        booking: reactivatedBooking,
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      amount: event.ticketPrice,
      paymentStatus: "unpaid",
      status: "pending",
    });

    return res.status(201).json({
      message: "Booking created. Proceeding to payment gateway...",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Booking failed",
      error: error.message,
    });
  }
};

export const confirmBooking = async (req, res) => {
  const { id } = req.params;

  const { razorpayOrderId, razorpayPaymentId } = req.body || {};

  try {
    const booking = await Booking.findById(id).populate("eventId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "booked") {
      return res.status(400).json({
        message: "Booking already confirmed",
      });
    }

    if (booking.eventId.availableSeats <= 0) {
      return res.status(400).json({
        message: "No seats available",
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "booked",
        paymentStatus: "paid",
        razorpayOrderId,
        razorpayPaymentId,
      },
      { new: true },
    );

    await Event.findByIdAndUpdate(booking.eventId._id, {
      $inc: { availableSeats: -1 },
    });

    sendEventStatusEmail(
      req.user.email,
      booking.eventId.name,
      "booking_success",
    ).catch((emailError) => {
      console.error("Booking confirmation email failed:", emailError);
    });

    return res.status(200).json({
      message: "Booking confirmed successfully",
      updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to confirm booking",
      error: error.message,
    });
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

    sendEventStatusEmail(
      req.user.email,
      booking.eventId.name,
      "booking_cancelled",
    ).catch((emailError) => {
      console.error("Booking cancellation email failed:", emailError);
    });

    return res
      .status(200)
      .json({ message: "Booking cancelled successfully", updatedBooking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to cancel booking", error: error.message });
  }
};

export const getAdminEventBookingsSummary = async (req, res) => {
  try {
    const { type = "summary" } = req.query;
    const events = await Event.find().lean();
    const eventIds = events.map((event) => event._id);

    const bookings = await Booking.find({ eventId: { $in: eventIds } }).lean();
    const users = await User.find().select("-password").lean();

    const usersById = users.reduce((acc, userData) => {
      acc[userData._id.toString()] = userData;
      return acc;
    }, {});

    const bookingsByEventId = bookings.reduce((acc, booking) => {
      const eventId = booking.eventId.toString();
      if (!acc[eventId]) {
        acc[eventId] = [];
      }

      acc[eventId].push({
        ...booking,
        userId: usersById[booking.userId.toString()] || booking.userId,
      });
      return acc;
    }, {});

    const eventsWithBookings = events.map((event) => {
      const eventBookings = bookingsByEventId[event._id.toString()] || [];
      return {
        ...event,
        bookingCount: eventBookings.length,
        bookings: eventBookings,
      };
    });

    if (type === "users") {
      const usersWithBookings = users.map((userData) => {
        const userBookings = bookings.filter(
          (booking) => booking.userId.toString() === userData._id.toString(),
        );

        return {
          ...userData,
          bookingCount: userBookings.length,
          bookings: userBookings.map((booking) => ({
            ...booking,
            eventId: events.find(
              (event) => event._id.toString() === booking.eventId.toString(),
            ),
          })),
        };
      });

      return res.status(200).json({ users: usersWithBookings });
    }

    if (type === "all") {
      const usersWithBookings = users.map((userData) => {
        const userBookings = bookings.filter(
          (booking) => booking.userId.toString() === userData._id.toString(),
        );

        return {
          ...userData,
          bookingCount: userBookings.length,
          bookings: userBookings.map((booking) => ({
            ...booking,
            eventId: events.find(
              (event) => event._id.toString() === booking.eventId.toString(),
            ),
          })),
        };
      });

      return res.status(200).json({
        events: eventsWithBookings,
        users: usersWithBookings,
      });
    }

    return res.status(200).json({ events: eventsWithBookings });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch summary",
      error: error.message,
    });
  }
};
