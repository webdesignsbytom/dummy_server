import { Router } from 'express';
import { validateAuthentication } from '../middleware/auth.js';
import { presignUploadHandler, signViewHandler, deleteMediaHandler } from '../controllers/mediaGeneric.js';

const router = Router();

// Uploads and deletes usually require auth; tweak as needed
router.get('/ping', (req, res) => res.json({ ok: true }));

router.post('/media/presign', validateAuthentication, presignUploadHandler);
router.get('/media/url', validateAuthentication, signViewHandler);
router.delete('/media/object', validateAuthentication, deleteMediaHandler);

export default router;