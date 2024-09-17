import { Router } from 'express';
import { validateAuthentication, validateDeveloperRole } from '../middleware/auth.js';
import { quickTestHandler, testError2025Handler } from '../controllers/tests.js';

const router = Router();

router.get('/quick-test', validateDeveloperRole, quickTestHandler);
router.get('/test-2025', validateDeveloperRole, testError2025Handler);

export default router;
