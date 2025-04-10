import { Router } from 'express';
import { validateAuthentication, validateDeveloperRole } from '../middleware/auth.js';
import { createNewBookingHandler, getAllBookingsHandler } from '../controllers/booking.js';

const router = Router();

router.get('/get-all-bookings', getAllBookingsHandler);
router.post('/create-new-booking', createNewBookingHandler);

// router.delete(
//   '/delete-event/:eventId',
//   deleteEventByIdHandler
// );
// router.delete(
//   '/delete-all-events',
//   deleteAllEventsHandler
// );

export default router;
