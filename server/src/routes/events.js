import { Router } from 'express';
import {
  deleteAllEventsHandler,
  deleteEventByIdHandler,
  getAllEvents,
} from '../controllers/events.js';
import { validateAuthentication, validateDeveloperRole } from '../middleware/auth.js';

const router = Router();

router.get('/', validateAuthentication, validateDeveloperRole, getAllEvents);
router.delete(
  '/delete-event/:eventId',
  validateAuthentication,
  validateDeveloperRole,
  deleteEventByIdHandler
);
router.delete(
  '/delete-all-events',
  validateAuthentication,
  validateDeveloperRole,
  deleteAllEventsHandler
);

export default router;
