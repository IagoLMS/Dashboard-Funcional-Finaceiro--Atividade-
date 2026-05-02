import { Router } from 'express';
import { costCentersController as ctrl } from '../controllers/costCenters.controller.js';

const router = Router();

router.get('/monthly-variation',  ctrl.getMonthlyVariation);
router.get('/',                   ctrl.list);
router.post('/',                  ctrl.create);
router.get('/:id/analysis',       ctrl.getAnalysis);
router.get('/:id',                ctrl.getById);
router.patch('/:id',              ctrl.update);
router.delete('/:id',             ctrl.delete);

export default router;
