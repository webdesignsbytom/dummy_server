import { Router } from 'express';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';
import {
  confirmNewBookingHandler,
  createNewBookingHandler,
  deleteBookingHandler,
  denyNewBookingHandler,
  getAllBookingsHandler,
} from '../controllers/booking.js';

const router = Router();

router.get('/get-all-bookings', getAllBookingsHandler);
router.post('/create-new-booking', createNewBookingHandler);
router.patch('/confirm-booking/:bookingId', confirmNewBookingHandler);
router.patch('/deny-booking/:bookingId', denyNewBookingHandler);
router.delete('/delete-booking', deleteBookingHandler);

export default router;
