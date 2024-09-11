import { Router } from 'express'
import { loginHelper, googleLoginHelper } from '../controllers/auth.js'

const router = Router()

router.post('/login', loginHelper)
router.post('/oauth-login', googleLoginHelper)

export default router
