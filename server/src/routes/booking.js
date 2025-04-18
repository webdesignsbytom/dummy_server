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
  getAllBookingsAdminHandler,
  getAllBookingsHandler,
  getBookingByIdHandler,
  getBookingsByDateHandler,
  getBookingsByEmailHandler,
  getTodaysBookingsHandler,
} from '../controllers/booking.js';

const router = Router();

router.get('/get-all-bookings', getAllBookingsHandler);
router.get('/get-all-bookings-admin', getAllBookingsAdminHandler);
router.get('/get-booking/:bookingId', getBookingByIdHandler);
router.get('/get-bookings-by-email/:email', getBookingsByEmailHandler);
router.get('/get-bookings-by-date/:date', getBookingsByDateHandler);
router.get('/get-todays-date-bookings', getTodaysBookingsHandler);
router.post('/create-new-booking', createNewBookingHandler);
router.patch('/confirm-booking/:bookingId', confirmNewBookingHandler);
router.patch('/deny-booking/:bookingId', denyNewBookingHandler);
router.patch('/cancel-booking/:bookingId', cancelBookingHandler);
router.patch('/edit-booking/:bookingId', editBookingHandler);
router.delete('/delete-booking/:bookingId', deleteBookingHandler);
router.delete('/delete-all-bookings', deleteAllBookingHandler);

export default router;
