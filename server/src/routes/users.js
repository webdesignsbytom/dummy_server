import { Router } from 'express';
import {
  getAllUsers,
  registerNewUser,
  getUserById,
  deleteUser,
  updateUser
} from '../controllers/users.js';
import { validateAuthentication, validateAdminRole } from '../middleware/auth.js';

const router = Router();

router.get('/', validateAuthentication, validateAdminRole, getAllUsers);
router.post('/register', registerNewUser);
router.get('/:id', getUserById); 
router.put('/account/update/:userId', updateUser);
router.delete('/delete-user/:userId', validateAuthentication, validateAdminRole, deleteUser);

export default router;
