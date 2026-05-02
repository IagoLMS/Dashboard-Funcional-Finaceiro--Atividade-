import { dashboardKpisService as svc } from '../services/dashboardKpis.service.js';

export const dashboardController = {
  getKpis:        async (_req, res, next) => { try { res.json(await svc.getKpis()); }        catch(e) { next(e); } },
  getMonthly:     async (_req, res, next) => { try { res.json(await svc.getMonthly()); }     catch(e) { next(e); } },
  getDepartments: async (_req, res, next) => { try { res.json(await svc.getDepartments()); } catch(e) { next(e); } },
};
