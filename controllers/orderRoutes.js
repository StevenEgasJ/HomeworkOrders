import { Router } from 'express';
import { avgOrderValue, topProducts, topCustomers, salesByDay, highValueOrders, monthlySummary } from './orderStatsController.js';

const router = Router();

router.get('/stats/average', avgOrderValue);
router.get('/stats/top-products', topProducts);
router.get('/stats/top-customers', topCustomers);
router.get('/stats/sales-by-day', salesByDay);
router.get('/stats/high-value', highValueOrders);
router.get('/stats/monthly-summary', monthlySummary);

export default router;
