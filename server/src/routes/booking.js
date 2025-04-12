import { Router } from 'express';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';
import {
  cancelBookingHandler,
  confirmNewBookingHandler,
  createNewBookingHandler,
  deleteAllBookingHandler,
  deleteBookingHandler,
  denyNewBookingHandler,
  editBookingHandler,
  getAllBookingsHandler,
  getTodaysBookingsHandler,
} from '../controllers/booking.js';

const router = Router();

router.get('/get-all-bookings', getAllBookingsHandler);
router.get('/get-todays-date-bookings', getTodaysBookingsHandler);
router.post('/create-new-booking', createNewBookingHandler);
router.patch('/confirm-booking/:bookingId', confirmNewBookingHandler);
router.patch('/deny-booking/:bookingId', denyNewBookingHandler);
router.patch('/cancel-booking/:bookingId', cancelBookingHandler);
router.patch('/edit-booking/:bookingId', editBookingHandler);
router.delete('/delete-booking', deleteBookingHandler);
router.delete('/delete-all-bookings', deleteAllBookingHandler);

export default router;
