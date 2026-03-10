import { Router } from 'express';
import {
    getOrders,
    updateOrder,
    addComment,
    getStatistics,
    getGroups,
    createGroup,
    exportToExcel
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);


router.get('/export', exportToExcel);
router.get('/stats', getStatistics);
router.get('/groups', getGroups);
router.post('/groups', createGroup);


router.get('/', getOrders);


router.patch('/:id', updateOrder);
router.post('/:id/comment', addComment);

export default router;