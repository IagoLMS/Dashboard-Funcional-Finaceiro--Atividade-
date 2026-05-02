import { cashflowService as svc } from '../services/cashflow.service.js';

export const cashflowController = {
  list:    async (_req, res, next) => { try { res.json(await svc.list()); }                                      catch(e) { next(e); } },
  getById: async (req, res, next)  => { try { res.json(await svc.getById(Number(req.params.id))); }             catch(e) { next(e); } },
  create:  async (req, res, next)  => { try { res.status(201).json(await svc.create(req.body)); }               catch(e) { next(e); } },
  update:  async (req, res, next)  => { try { res.json(await svc.update(Number(req.params.id), req.body)); }    catch(e) { next(e); } },
  delete:  async (req, res, next)  => { try { await svc.delete(Number(req.params.id)); res.status(204).end(); } catch(e) { next(e); } },
};
