import { apiClient } from '../../../services/apiClient.js';

export const payablesApiRepo = {
  list:            ()             => apiClient.get('/api/payables'),
  getById:         (id)           => apiClient.get(`/api/payables/${id}`),
  create:          (data)         => apiClient.post('/api/payables', data),
  update:          (id, data)     => apiClient.patch(`/api/payables/${id}`, data),
  remove:          (id)           => apiClient.delete(`/api/payables/${id}`),
  registerPayment: (id, payment)  => apiClient.post(`/api/payables/${id}/payments`, payment),
};
