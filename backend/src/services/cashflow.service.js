import { cashflowRepository as repo } from '../repositories/cashflow.repository.js';

const today = () => new Date().toISOString().slice(0, 10);

export const cashflowService = {
  list: () => repo.findAll(),

  getById: async (id) => {
    const e = await repo.findById(id);
    if(!e) throw Object.assign(new Error('Entry not found'), { statusCode: 404 });
    return e;
  },

  create: (data) => repo.create({
    date:        data.date || today(),
    description: data.description,
    category:    data.category,
    type:        data.type,
    value:       Number(data.value),
    status:      data.status || 'confirmed',
    origin:      data.origin || 'manual',
    observation: data.observation || '',
  }),

  update: async (id, data) => {
    await cashflowService.getById(id);
    return repo.update(id, {
      date:        data.date,
      description: data.description,
      category:    data.category,
      type:        data.type,
      value:       Number(data.value),
      status:      data.status,
      observation: data.observation ?? '',
    });
  },

  delete: async (id) => {
    await cashflowService.getById(id);
    await repo.delete(id);
  },
};
