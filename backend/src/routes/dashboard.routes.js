import { Router } from 'express';
import { dashboardController as ctrl } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/kpis',        ctrl.getKpis);
router.get('/monthly',     ctrl.getMonthly);
router.get('/departments', ctrl.getDepartments);

export default router;
