import { INITIAL_RECEIVABLES } from '../../seed/receivables.seed.js';
import { addDays, today, validatePayment } from '../../../utils/businessRules.js';

const KEY = 'mock:receivables';

function load() {
  try {
    const stored = sessionStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(INITIAL_RECEIVABLES));
  } catch { return JSON.parse(JSON.stringify(INITIAL_RECEIVABLES)) }
}

function save(list) {
  try { sessionStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
}

export const receivablesMockRepo = {
  list: () => Promise.resolve(load()),

  getById: (id) => Promise.resolve(load().find(r => r.id === id) || null),

  create: (data) => {
    const current      = load();
    const installments = Number(data.installments) || 1;
    const perValue     = parseFloat((Number(data.totalValue) / installments).toFixed(2));
    const newEntries   = [];

    for(let i = 0; i < installments; i++) {
      const dueDate = addDays(data.dueDate, i * 30);
      newEntries.push({
        id:          Date.now() + i,
        client:      data.client,
        origin:      data.origin || '',
        totalValue:  perValue,
        paidValue:   0,
        issueDate:   today(),
        dueDate,
        observation: installments > 1
          ? `Parcela ${i + 1}/${installments}${data.observation ? ' — ' + data.observation : ''}`
          : (data.observation || ''),
        payments: [],
      });
    }

    const updated = [...newEntries, ...current];
    save(updated);
    return Promise.resolve(updated);
  },

  update: (id, data) => {
    const current = load();
    const updated = current.map(r => r.id === id ? { ...r, ...data } : r);
    save(updated);
    return Promise.resolve(updated);
  },

  remove: (id) => {
    const current = load();
    const updated = current.filter(r => r.id !== id);
    save(updated);
    return Promise.resolve(updated);
  },

  registerPayment: (id, { amount, date, method }) => {
    const current    = load();
    const receivable = current.find(r => r.id === id);
    if(!receivable) return Promise.resolve({ updated: current, error: 'Conta não encontrada.' });

    const { error } = validatePayment(receivable, amount);
    if(error) return Promise.resolve({ updated: current, error });

    const amt        = Number(amount);
    const newPayment = { id: Date.now(), date, amount: amt, method };
    const newPaid    = (Number(receivable.paidValue) || 0) + amt;

    const updated = current.map(r =>
      r.id === id
        ? { ...r, paidValue: newPaid, payments: [...(r.payments || []), newPayment] }
        : r
    );
    save(updated);
    return Promise.resolve({ updated, error: null });
  },
};
