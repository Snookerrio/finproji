import { Router } from 'express';
import { login, activateManager } from '../controllers/auth.controller.ts';

const router = Router();



router.post('/login', login);
router.patch('/activate/:token', activateManager);


router.post('/activate', activateManager);

export default router;