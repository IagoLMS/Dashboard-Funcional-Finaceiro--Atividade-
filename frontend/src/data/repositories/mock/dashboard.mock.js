import { KPI_DATA, MONTHLY_DATA, DEPARTMENTS } from '../../seed/dashboard.seed.js';

export const dashboardMockRepo = {
  getKpis:       () => Promise.resolve({ ...KPI_DATA }),
  getMonthly:    () => Promise.resolve([...MONTHLY_DATA]),
  getDepartments:() => Promise.resolve([...DEPARTMENTS]),
};
