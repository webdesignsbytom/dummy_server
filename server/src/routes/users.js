import { Router } from 'express';
import {
  registerNewUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  deleteUserAccountHandler,
  adminDeleteUserHandler,
  verifyUserEmailHandler,
  resendVerificationEmailHandler,
  updateUserDataHandler,
  changeUserRoleHandler, deactivateUserHandler, reactivateUserHandler
} from '../controllers/users.js';
import { validateAuthentication, validateAdminRole } from '../middleware/auth.js';

const router = Router();

// General
router.post('/register', registerNewUserHandler);
router.get('/user/get-user-by-id/:userId',  getUserByIdHandler); 
router.post('/user/update-user-data',  updateUserDataHandler); 
router.patch(
  '/account/deactivate/:userId',
  validateAuthentication,
  validateAdminRole,
  deactivateUserHandler
);
router.patch(
  '/account/reactivate/:userId',
  validateAuthentication,
  validateAdminRole,
  reactivateUserHandler
);
// Verification
router.patch('/verify-email/:userId/:uniqueString',  verifyUserEmailHandler); 
router.post('/verify-email/resend-email/:email', resendVerificationEmailHandler);
router.delete('/user/delete-account', validateAuthentication, deleteUserAccountHandler);
// Admin
router.get('/admin/get-all-users', validateAuthentication, validateAdminRole, getAllUsersHandler);
router.patch('/admin/change-user-role', validateAuthentication, validateAdminRole, changeUserRoleHandler);
router.delete('/admin/delete-user-by-id', validateAuthentication, validateAdminRole, adminDeleteUserHandler);

export default router;
