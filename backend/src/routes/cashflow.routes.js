import { Router } from 'express';
import { cashflowController as ctrl } from '../controllers/cashflow.controller.js';

const router = Router();

router.get('/',       ctrl.list);
router.post('/',      ctrl.create);
router.get('/:id',    ctrl.getById);
router.patch('/:id',  ctrl.update);
router.delete('/:id', ctrl.delete);

export default router;
