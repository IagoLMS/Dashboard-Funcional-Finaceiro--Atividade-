import { apiClient } from '../../../services/apiClient.js';

export const costCentersApiRepo = {
  list:               ()         => apiClient.get('/api/cost-centers'),
  getById:            (id)       => apiClient.get(`/api/cost-centers/${id}`),
  create:             (data)     => apiClient.post('/api/cost-centers', data),
  update:             (id, data) => apiClient.patch(`/api/cost-centers/${id}`, data),
  remove:             (id)       => apiClient.delete(`/api/cost-centers/${id}`),
  getAnalysis:        (id)       => apiClient.get(`/api/cost-centers/${id}/analysis`),
  getMonthlyVariation:()         => apiClient.get('/api/cost-centers/monthly-variation'),
};
