import { costCentersService as svc } from '../services/costCenters.service.js';

export const costCentersController = {
  list:               async (_req, res, next) => { try { res.json(await svc.list()); }                                      catch(e) { next(e); } },
  getById:            async (req, res, next)  => { try { res.json(await svc.getById(Number(req.params.id))); }             catch(e) { next(e); } },
  create:             async (req, res, next)  => { try { res.status(201).json(await svc.create(req.body)); }               catch(e) { next(e); } },
  update:             async (req, res, next)  => { try { res.json(await svc.update(Number(req.params.id), req.body)); }    catch(e) { next(e); } },
  delete:             async (req, res, next)  => { try { await svc.delete(Number(req.params.id)); res.status(204).end(); } catch(e) { next(e); } },
  getAnalysis:        async (req, res, next)  => { try { res.json(await svc.getAnalysis(Number(req.params.id))); }        catch(e) { next(e); } },
  getMonthlyVariation:async (_req, res, next) => { try { res.json(await svc.getMonthlyVariation()); }                     catch(e) { next(e); } },
};
