import { Router } from 'express';
import {
    getAllManagers,
    createManager,
    createActivationToken,
    banUser,
    unbanUser,
    getStats
} from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();


router.use(protect, adminOnly);


router.get('/users', getAllManagers);
router.post('/users', createManager);



router.post('/users/:id/re-token', createActivationToken);
router.post('/users/:id/recovery', createActivationToken);


router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);


router.get('/stats', getStats);

export default router;