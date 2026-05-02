import { INITIAL_COST_CENTERS } from '../../seed/costCenters.seed.js';
import { INITIAL_PAYABLES }     from '../../seed/payables.seed.js';
import {
  validateCostCenter,
  computeCostCenterAnalysis,
  computeCostCentersMonthlyVariation,
} from '../../../utils/businessRules.js';

const KEY          = 'mock:costCenters';
const PAYABLES_KEY = 'mock:payables';

function loadCenters() {
  try {
    const stored = sessionStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(INITIAL_COST_CENTERS));
  } catch { return JSON.parse(JSON.stringify(INITIAL_COST_CENTERS)) }
}

function loadPayables() {
  try {
    const stored = sessionStorage.getItem(PAYABLES_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(INITIAL_PAYABLES));
  } catch { return JSON.parse(JSON.stringify(INITIAL_PAYABLES)) }
}

function saveCenters(list) {
  try { sessionStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
}

export const costCentersMockRepo = {
  list: () => Promise.resolve(loadCenters()),

  getById: (id) => Promise.resolve(loadCenters().find(c => c.id === id) || null),

  create: (data) => {
    const current   = loadCenters();
    const { error } = validateCostCenter(data, current);
    if(error) return Promise.resolve({ updated: current, error });

    const newCenter = {
      id:          Date.now(),
      name:        data.name.trim(),
      type:        data.type,
      budget:      Number(data.budget),
      description: (data.description || '').trim(),
      categories:  Array.isArray(data.categories) ? data.categories : [],
    };

    const updated = [newCenter, ...current];
    saveCenters(updated);
    return Promise.resolve({ updated, error: null });
  },

  update: (id, data) => {
    const current = loadCenters();
    const center  = current.find(c => c.id === id);
    if(!center) return Promise.resolve({ updated: current, error: 'Centro não encontrado.' });

    const { error } = validateCostCenter(data, current, id);
    if(error) return Promise.resolve({ updated: current, error });

    const updated = current.map(c => c.id === id ? {
      ...c,
      name:        data.name.trim(),
      type:        data.type,
      budget:      Number(data.budget),
      description: (data.description || '').trim(),
      categories:  Array.isArray(data.categories) ? data.categories : c.categories,
    } : c);

    saveCenters(updated);
    return Promise.resolve({ updated, error: null });
  },

  remove: (id) => {
    const current  = loadCenters();
    const center   = current.find(c => c.id === id);
    if(!center) return Promise.resolve({ updated: current, error: 'Centro não encontrado.' });

    const linked = loadPayables().filter(p => (center.categories || []).includes(p.category));
    if(linked.length > 0) {
      return Promise.resolve({
        updated: current,
        error: `Não é possível excluir: existem ${linked.length} transação(ões) vinculada(s) a este centro.`,
      });
    }

    const updated = current.filter(c => c.id !== id);
    saveCenters(updated);
    return Promise.resolve({ updated, error: null });
  },

  getAnalysis: (id) => {
    const center = loadCenters().find(c => c.id === id);
    if(!center) return Promise.resolve(null);
    return Promise.resolve(computeCostCenterAnalysis(center, loadPayables()));
  },

  getMonthlyVariation: () => {
    return Promise.resolve(computeCostCentersMonthlyVariation(loadCenters(), loadPayables()));
  },
};
