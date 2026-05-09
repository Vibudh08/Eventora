import express from 'express';
import { admin, protect } from '../middleware/auth.js';
import { bookEvent, getMyBookings, confirmBooking, cancelBooking, getAdminEventBookingsSummary } from '../controllers/bookingController.js';
const router = express.Router();

router.post("/", protect, bookEvent);
router.get("/me", protect, getMyBookings);
router.put("/:id/confirm", protect, confirmBooking);
router.delete("/:id", protect, cancelBooking);
router.get(
  "/admin/events-summary",
  protect,
  admin,
  getAdminEventBookingsSummary,
);



export default router;
