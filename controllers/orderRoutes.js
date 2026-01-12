import { Router } from 'express';
import { placeOrder, payOrder, shipOrder, cancelOrder, getOrder } from './orderController.js';

const router = Router();
router.post('/place', placeOrder);
router.post('/:id/pay', payOrder);
router.post('/:id/ship', shipOrder);
router.post('/:id/cancel', cancelOrder);
router.get('/:id', getOrder);

export default router;
