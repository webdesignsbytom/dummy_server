import { Router } from 'express';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';
import {
  createNewBookingHandler,
  deleteBookingHandler,
  getAllBookingsHandler,
} from '../controllers/booking.js';

const router = Router();

router.get('/get-all-bookings', getAllBookingsHandler);
router.post('/create-new-booking', createNewBookingHandler);
router.delete('/delete-booking', deleteBookingHandler);

export default router;
