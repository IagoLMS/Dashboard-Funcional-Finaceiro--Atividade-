import { apiClient } from '../../../services/apiClient.js';

export const dashboardApiRepo = {
  getKpis:        () => apiClient.get('/api/dashboard/kpis'),
  getMonthly:     () => apiClient.get('/api/dashboard/monthly'),
  getDepartments: () => apiClient.get('/api/dashboard/departments'),
};
