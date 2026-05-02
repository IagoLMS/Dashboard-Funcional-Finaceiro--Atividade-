import { receivablesRepository as repo } from '../repositories/receivables.repository.js';
import { computeReceivableStatus }        from './statusCalculator.js';

const addDays = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

function withStatus(r) {
  return { ...r, _status: computeReceivableStatus(r) };
}

export const receivablesService = {
  list: async () => {
    const list = await repo.findAll();
    return list.map(withStatus);
  },

  getById: async (id) => {
    const r = await repo.findById(id);
    if(!r) throw Object.assign(new Error('Receivable not found'), { statusCode: 404 });
    return withStatus(r);
  },

  create: async (data) => {
    const installments = Number(data.installments) || 1;
    const perValue     = parseFloat((Number(data.totalValue) / installments).toFixed(2));
    const created      = [];

    for(let i = 0; i < installments; i++) {
      const dueDate = addDays(data.dueDate, i * 30);
      const r = await repo.create({
        client:      data.client,
        origin:      data.origin || '',
        totalValue:  perValue,
        paidValue:   0,
        issueDate:   today(),
        dueDate,
        observation: installments > 1
          ? `Parcela ${i + 1}/${installments}${data.observation ? ' — ' + data.observation : ''}`
          : (data.observation || ''),
      });
      created.push(withStatus(r));
    }
    return created;
  },

  update: async (id, data) => {
    await receivablesService.getById(id);
    const updated = await repo.update(id, {
      client:      data.client,
      origin:      data.origin ?? '',
      totalValue:  data.totalValue,
      dueDate:     data.dueDate,
      observation: data.observation ?? '',
    });
    return withStatus(updated);
  },

  delete: async (id) => {
    await receivablesService.getById(id);
    await repo.delete(id);
  },

  registerPayment: async (id, { amount, date, method }) => {
    const receivable = await receivablesService.getById(id);
    const balance    = (Number(receivable.totalValue) || 0) - (Number(receivable.paidValue) || 0);
    const amt        = Number(amount) || 0;

    if(amt <= 0)      throw Object.assign(new Error('Valor deve ser maior que zero.'),               { statusCode: 400 });
    if(amt > balance) throw Object.assign(new Error('Valor não pode ultrapassar o saldo restante.'), { statusCode: 400 });

    await repo.createPayment(id, { date, amount: amt, method });
    const newPaid = (Number(receivable.paidValue) || 0) + amt;
    const updated = await repo.updatePaidValue(id, newPaid);
    return withStatus(updated);
  },
};
