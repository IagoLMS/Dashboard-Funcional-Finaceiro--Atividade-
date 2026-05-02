import { INITIAL_PAYABLES } from '../../seed/payables.seed.js';
import { addDays, today, validatePayment } from '../../../utils/businessRules.js';

const KEY = 'mock:payables';

function load() {
  try {
    const stored = sessionStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(INITIAL_PAYABLES));
  } catch { return JSON.parse(JSON.stringify(INITIAL_PAYABLES)) }
}

function save(list) {
  try { sessionStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
}

export const payablesMockRepo = {
  list: () => Promise.resolve(load()),

  getById: (id) => Promise.resolve(load().find(p => p.id === id) || null),

  create: (data) => {
    const current      = load();
    const installments = Number(data.installments) || 1;
    const perValue     = parseFloat((Number(data.totalValue) / installments).toFixed(2));
    const newEntries   = [];

    for(let i = 0; i < installments; i++) {
      const dueDate = addDays(data.dueDate, i * 30);
      newEntries.push({
        id:          Date.now() + i,
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
        payments: [],
      });
    }

    const updated = [...newEntries, ...current];
    save(updated);
    return Promise.resolve(updated);
  },

  update: (id, data) => {
    const current = load();
    const updated = current.map(p => p.id === id ? { ...p, ...data } : p);
    save(updated);
    return Promise.resolve(updated);
  },

  remove: (id) => {
    const current = load();
    const updated = current.filter(p => p.id !== id);
    save(updated);
    return Promise.resolve(updated);
  },

  registerPayment: (id, { amount, date, method }) => {
    const current = load();
    const payable = current.find(p => p.id === id);
    if(!payable) return Promise.resolve({ updated: current, error: 'Conta não encontrada.' });

    const { error } = validatePayment(payable, amount);
    if(error) return Promise.resolve({ updated: current, error });

    const amt        = Number(amount);
    const newPayment = { id: Date.now(), date, amount: amt, method };
    const newPaid    = (Number(payable.paidValue) || 0) + amt;

    const updated = current.map(p =>
      p.id === id
        ? { ...p, paidValue: newPaid, payments: [...(p.payments || []), newPayment] }
        : p
    );
    save(updated);
    return Promise.resolve({ updated, error: null });
  },
};
