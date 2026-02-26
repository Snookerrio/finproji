import { Router } from 'express';

import { login, activateManager, refresh } from '../controllers/auth.controller.js';

const router = Router();


router.post('/login', login);



router.post('/refresh', refresh);


router.post('/activate', activateManager);

export default router;