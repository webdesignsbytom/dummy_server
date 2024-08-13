import { Router } from 'express';
import {
  registerNewUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  deleteUserAccountHandler,
  adminDeleteUserHandler
} from '../controllers/users.js';
import { validateAuthentication, validateAdminRole } from '../middleware/auth.js';

const router = Router();

// General
router.post('/register', registerNewUserHandler);
router.get('/user/get-user-by-id/:userId',  getUserByIdHandler); 
router.delete('/user/delete-account', validateAuthentication, deleteUserAccountHandler);
// Admin
router.get('/admin/get-all-users', validateAuthentication, validateAdminRole, getAllUsersHandler);
router.delete('/admin/delete-user-by-id/:userId', validateAuthentication, validateAdminRole, adminDeleteUserHandler);

export default router;
