import { Router } from 'express';
import {
  registerNewUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  deleteUserAccountHandler,
  adminDeleteUserHandler,
  verifyUserEmailAddressHandler,
  resendVerificationEmailHandler,
  updateUserDataHandler,
  changeUserRoleHandler, deactivateUserHandler, reactivateUserHandler
} from '../controllers/users.js';
import { validateAuthentication, validateAdminRole } from '../middleware/auth.js';

const router = Router();

// General
router.post('/register-new-user', registerNewUserHandler);
router.get('/user/get-user-by-id/:userId',  getUserByIdHandler); 
router.get('/user/get-logged-in-user/:userId', validateAuthentication, getUserByIdHandler); 
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
router.patch('/verify-email/:userId/:uniqueString',  verifyUserEmailAddressHandler); 
router.post('/verify-email/resend-email/:email', resendVerificationEmailHandler);
router.delete('/user/delete-account', validateAuthentication, deleteUserAccountHandler);
// Admin
router.get('/admin/get-all-users', getAllUsersHandler);
router.patch('/admin/change-user-role', validateAuthentication, validateAdminRole, changeUserRoleHandler);
router.delete('/admin/delete-user-by-id', validateAuthentication, validateAdminRole, adminDeleteUserHandler);

export default router;
