import { apiClient } from '../../../services/apiClient.js';

export const receivablesApiRepo = {
  list:            ()              => apiClient.get('/api/receivables'),
  getById:         (id)            => apiClient.get(`/api/receivables/${id}`),
  create:          (data)          => apiClient.post('/api/receivables', data),
  update:          (id, data)      => apiClient.patch(`/api/receivables/${id}`, data),
  remove:          (id)            => apiClient.delete(`/api/receivables/${id}`),
  registerPayment: (id, payment)   => apiClient.post(`/api/receivables/${id}/payments`, payment),
};
