import { apiClient } from '../../../services/apiClient.js';

export const cashFlowApiRepo = {
  list:     ()          => apiClient.get('/api/cashflow'),
  getById:  (id)        => apiClient.get(`/api/cashflow/${id}`),
  create:   (data)      => apiClient.post('/api/cashflow', data),
  update:   (id, data)  => apiClient.patch(`/api/cashflow/${id}`, data),
  remove:   (id)        => apiClient.delete(`/api/cashflow/${id}`),
};
