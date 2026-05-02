import { payablesRepository as repo } from '../repositories/payables.repository.js';
import { computePayableStatus }       from './statusCalculator.js';

const addDays = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

function withStatus(payable) {
  return { ...payable, status: computePayableStatus(payable) };
}

export const payablesService = {
  list: async () => {
    const list = await repo.findAll();
    return list.map(withStatus);
  },

  getById: async (id) => {
    const p = await repo.findById(id);
    if(!p) throw Object.assign(new Error('Payable not found'), { statusCode: 404 });
    return withStatus(p);
  },

  create: async (data) => {
    const installments = Number(data.installments) || 1;
    const perValue     = parseFloat((Number(data.totalValue) / installments).toFixed(2));
    const created      = [];

    for(let i = 0; i < installments; i++) {
      const dueDate = addDays(data.dueDate, i * 30);
      const p = await repo.create({
        supplier:    data.supplier,
        origin:      data.origin || '',
        category:    data.category,
        totalValue:  perValue,
        paidValue:   0,
        issueDate:   today(),
        dueDate,
        observation: installments > 1
          ? `Parcela ${i + 1}/${installments}${data.observation ? ' — ' + data.observation : ''}`
          : (data.observation || ''),
      });
      created.push(withStatus(p));
    }
    return created;
  },

  update: async (id, data) => {
    await payablesService.getById(id);
    const updated = await repo.update(id, {
      supplier:    data.supplier,
      origin:      data.origin,
      category:    data.category,
      totalValue:  data.totalValue,
      dueDate:     data.dueDate,
      observation: data.observation ?? '',
    });
    return withStatus(updated);
  },

  delete: async (id) => {
    await payablesService.getById(id);
    await repo.delete(id);
  },

  registerPayment: async (id, { amount, date, method }) => {
    const payable = await payablesService.getById(id);
    const balance = (Number(payable.totalValue) || 0) - (Number(payable.paidValue) || 0);
    const amt     = Number(amount) || 0;

    if(amt <= 0)      throw Object.assign(new Error('Valor deve ser maior que zero.'),          { statusCode: 400 });
    if(amt > balance) throw Object.assign(new Error('Valor não pode ultrapassar o saldo restante.'), { statusCode: 400 });

    await repo.createPayment(id, { date, amount: amt, method });
    const newPaid = (Number(payable.paidValue) || 0) + amt;
    const updated = await repo.updatePaidValue(id, newPaid);
    return withStatus(updated);
  },
};
