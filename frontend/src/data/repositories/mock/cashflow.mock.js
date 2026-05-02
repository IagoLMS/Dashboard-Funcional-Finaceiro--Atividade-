import { INITIAL_CASH_FLOW } from '../../seed/cashflow.seed.js';

const KEY = 'mock:cashflow';

function load() {
  try {
    const stored = sessionStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(INITIAL_CASH_FLOW));
  } catch { return JSON.parse(JSON.stringify(INITIAL_CASH_FLOW)) }
}

function save(list) {
  try { sessionStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
}

export const cashFlowMockRepo = {
  list: () => Promise.resolve(load()),

  getById: (id) => Promise.resolve(load().find(e => e.id === id) || null),

  create: (data) => {
    const current  = load();
    const newEntry = { ...data, id: Date.now(), origin: 'manual' };
    const updated  = [newEntry, ...current];
    save(updated);
    return Promise.resolve(updated);
  },

  update: (id, data) => {
    const current = load();
    const updated = current.map(e => e.id === id ? { ...e, ...data } : e);
    save(updated);
    return Promise.resolve(updated);
  },

  remove: (id) => {
    const current = load();
    const updated = current.filter(e => e.id !== id);
    save(updated);
    return Promise.resolve(updated);
  },
};
