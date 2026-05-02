import { Router } from 'express';
import { receivablesController as ctrl } from '../controllers/receivables.controller.js';

const router = Router();

router.get('/',              ctrl.list);
router.post('/',             ctrl.create);
router.get('/:id',           ctrl.getById);
router.patch('/:id',         ctrl.update);
router.delete('/:id',        ctrl.delete);
router.post('/:id/payments', ctrl.registerPayment);

export default router;
