import dns from "node:dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config({ quiet: true });

const demoExtras = [
  ["Aarav Sharma", "Mumbai Indie Music Night", "pending", "unpaid"],
  ["Priya Iyer", "Delhi Startup Mixer", "cancelled", "paid"],
];

const seedBookings = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const demoUsers = await User.find({ email: /@eventora\.demo$/ })
    .select("_id email name")
    .sort({ email: 1 })
    .lean();
  const events = await Event.find()
    .select("_id name ticketPrice totalSeats availableSeats")
    .sort({ name: 1 })
    .lean();

  if (demoUsers.length < 3 || events.length === 0) {
    throw new Error("Not enough demo users/events found to seed bookings.");
  }

  const eventsByName = Object.fromEntries(events.map((event) => [event.name, event]));
  const existingBookings = await Booking.find().lean();
  const bookedCountByEventId = existingBookings.reduce((counts, booking) => {
    if (booking.status === "booked") {
      const eventId = booking.eventId.toString();
      counts[eventId] = (counts[eventId] || 0) + 1;
    }

    return counts;
  }, {});

  const bookingDocs = [];
  let userIndex = 0;

  for (const event of events) {
    const eventId = event._id.toString();
    const desiredBookedCount = Math.max(0, event.totalSeats - event.availableSeats);
    const currentBookedCount = bookedCountByEventId[eventId] || 0;
    const missingBookedCount = Math.max(0, desiredBookedCount - currentBookedCount);

    for (let index = 0; index < missingBookedCount; index += 1) {
      const user = demoUsers[userIndex % demoUsers.length];
      userIndex += 1;

      bookingDocs.push({
        userId: user._id,
        eventId: event._id,
        status: "booked",
        paymentStatus: "paid",
        amount: event.ticketPrice,
        razorpayOrderId: `seed_order_${eventId}_${index}`,
        razorpayPaymentId: `seed_payment_${eventId}_${index}`,
      });
    }
  }

  for (const [userName, eventName, status, paymentStatus] of demoExtras) {
    const user = demoUsers.find((demoUser) => demoUser.name === userName) || demoUsers[0];
    const event = eventsByName[eventName];

    if (!event) {
      continue;
    }

    const razorpayOrderId = `seed_order_extra_${event._id}_${status}`;
    const extraAlreadyExists = existingBookings.some(
      (booking) => booking.razorpayOrderId === razorpayOrderId,
    );

    if (extraAlreadyExists) {
      continue;
    }

    bookingDocs.push({
      userId: user._id,
      eventId: event._id,
      status,
      paymentStatus,
      amount: event.ticketPrice,
      razorpayOrderId,
      razorpayPaymentId:
        paymentStatus === "paid" ? `seed_payment_extra_${event._id}_${status}` : undefined,
    });
  }

  if (bookingDocs.length > 0) {
    await Booking.insertMany(bookingDocs);
  }

  const totalBookings = await Booking.countDocuments();
  const groupedBookings = await Booking.aggregate([
    {
      $group: {
        _id: {
          eventId: "$eventId",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  console.log(
    JSON.stringify(
      {
        inserted: bookingDocs.length,
        totalBookings,
        groupedBookings,
      },
      null,
      2,
    ),
  );
};

seedBookings()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
