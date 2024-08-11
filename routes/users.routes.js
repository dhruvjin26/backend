import { Router } from 'express';

import { registerUSer,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser
        } from '../controllers/users.controllers.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerUSer)
router.post('/login', loginUser)
router.post('/logout', verifyJWT ,logoutUser)
router.post('/refresh-token',verifyJWT, refreshAccessToken)
router.post('/change-password', verifyJWT, changeCurrentPassword)
router.get('/c/:username', verifyJWT, getCurrentUser)




export default router;


