import express from 'express';
import { protect } from '../middleware/auth.js';
import { bookEvent, getMyBookings, confirmBooking, cancelBooking } from '../controllers/bookingController.js';
const router = express.Router();

router.post("/", protect, bookEvent);
router.get("/me", protect, getMyBookings);
router.put("/:id/confirm", protect, confirmBooking);
router.delete("/:id", protect, cancelBooking);


export default router;