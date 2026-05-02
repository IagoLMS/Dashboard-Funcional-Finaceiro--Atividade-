/**
 * FAÇADE — mantida para compatibilidade retroativa com imports existentes.
 * Toda lógica real migrou para:
 *   - src/data/seed/*.js           (dados iniciais)
 *   - src/utils/businessRules.js   (regras puras)
 *
 * UsersPage continua usando getUsers/saveUsers diretamente (fora do escopo da migração).
 */

export { KPI_DATA, MONTHLY_DATA, DEPARTMENTS }          from '../data/seed/dashboard.seed.js';
export { CASH_FLOW_CATEGORIES, INITIAL_CASH_FLOW }      from '../data/seed/cashflow.seed.js';
export { RECEIVABLE_CLIENTS, INITIAL_RECEIVABLES }      from '../data/seed/receivables.seed.js';
export { PAYABLE_ORIGINS, PAYABLE_CATEGORIES, PAYABLE_SUPPLIERS, INITIAL_PAYABLES } from '../data/seed/payables.seed.js';
export { COST_CENTER_TYPES, INITIAL_COST_CENTERS }      from '../data/seed/costCenters.seed.js';
export { computeReceivableStatus, computePayableStatus } from './businessRules.js';

import { addDays, today } from './businessRules.js';
import { INITIAL_CASH_FLOW }     from '../data/seed/cashflow.seed.js';
import { INITIAL_RECEIVABLES }   from '../data/seed/receivables.seed.js';
import { INITIAL_PAYABLES }      from '../data/seed/payables.seed.js';
import { INITIAL_COST_CENTERS }  from '../data/seed/costCenters.seed.js';
import {
  computePayableStatus,
  computeCostCenterAnalysis,
  computeCostCentersMonthlyVariation,
  validatePayment,
  validateCostCenter,
} from './businessRules.js';

// -------- USERS --------

const INITIAL_USERS = [
  { id: 1, name: 'Ana Rodrigues',  email: 'admin@empresa.com',    role: 'admin',  department: 'TI' },
  { id: 2, name: 'Carlos Mendes',  email: 'gestor@empresa.com',   role: 'gestor', department: 'Compras' },
  { id: 3, name: 'Beatriz Lima',   email: 'viewer@empresa.com',   role: 'viewer', department: 'RH' },
  { id: 4, name: 'Fernando Costa', email: 'fernando@empresa.com', role: 'gestor', department: 'Logística' },
  { id: 5, name: 'Mariana Souza',  email: 'mariana@empresa.com',  role: 'viewer', department: 'Produção' },
];

export function getUsers() {
  try {
    const stored = localStorage.getItem('cf_users');
    return stored ? JSON.parse(stored) : INITIAL_USERS;
  } catch { return INITIAL_USERS }
}

export function saveUsers(users) {
  localStorage.setItem('cf_users', JSON.stringify(users));
}

export const DEPT_LIST   = ['Produção', 'Logística', 'Compras', 'RH', 'TI'];
export const ROLE_LABELS = { gestor: 'Gestor', admin: 'Administrador', viewer: 'Visualizador' };

// -------- FLUXO DE CAIXA --------

export function getCashFlow() {
  try {
    const stored = localStorage.getItem('cf_cashflow');
    return stored ? JSON.parse(stored) : INITIAL_CASH_FLOW;
  } catch { return INITIAL_CASH_FLOW }
}

export function saveCashFlow(entries) {
  localStorage.setItem('cf_cashflow', JSON.stringify(entries));
}

export function addCashFlowEntry(entry) {
  const current  = getCashFlow();
  const newEntry = { ...entry, id: Date.now(), origin: 'manual' };
  const updated  = [newEntry, ...current];
  saveCashFlow(updated);
  return updated;
}

export function updateCashFlowEntry(id, data) {
  const current = getCashFlow();
  const updated = current.map(e => e.id === id ? { ...e, ...data } : e);
  saveCashFlow(updated);
  return updated;
}

export function deleteCashFlowEntry(id) {
  const current = getCashFlow();
  const updated = current.filter(e => e.id !== id);
  saveCashFlow(updated);
  return updated;
}

// -------- CONTAS A RECEBER --------

export function getReceivables() {
  try {
    const stored = localStorage.getItem('cf_receivables');
    return stored ? JSON.parse(stored) : INITIAL_RECEIVABLES;
  } catch { return INITIAL_RECEIVABLES }
}

export function saveReceivables(list) {
  localStorage.setItem('cf_receivables', JSON.stringify(list));
}

export function createReceivable(data) {
  const current      = getReceivables();
  const installments = Number(data.installments) || 1;
  const perValue     = parseFloat((Number(data.totalValue) / installments).toFixed(2));
  const newEntries   = [];

  for(let i = 0; i < installments; i++) {
    const dueDate = addDays(data.dueDate, i * 30);
    newEntries.push({
      id: Date.now() + i,
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
  saveReceivables(updated);
  return updated;
}

export function updateReceivable(id, data) {
  const current = getReceivables();
  const updated = current.map(r => r.id === id ? { ...r, ...data } : r);
  saveReceivables(updated);
  return updated;
}

export function deleteReceivable(id) {
  const current = getReceivables();
  const updated = current.filter(r => r.id !== id);
  saveReceivables(updated);
  return updated;
}

export function registerPayment(id, { amount, date, method }) {
  const current    = getReceivables();
  const receivable = current.find(r => r.id === id);
  if(!receivable) return { updated: current, error: 'Conta não encontrada.' };

  const { error } = validatePayment(receivable, amount);
  if(error) return { updated: current, error };

  const amt        = Number(amount);
  const newPayment = { id: Date.now(), date, amount: amt, method };
  const newPaid    = (Number(receivable.paidValue) || 0) + amt;

  const updated = current.map(r =>
    r.id === id
      ? { ...r, paidValue: newPaid, payments: [...(r.payments || []), newPayment] }
      : r
  );
  saveReceivables(updated);
  return { updated, error: null };
}

// -------- CONTAS A PAGAR --------

export function getPayables() {
  try {
    const stored = localStorage.getItem('cf_payables');
    return stored ? JSON.parse(stored) : INITIAL_PAYABLES;
  } catch { return INITIAL_PAYABLES }
}

export function savePayables(list) {
  localStorage.setItem('cf_payables', JSON.stringify(list));
}

export function createPayable(data) {
  const current      = getPayables();
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
  savePayables(updated);
  return updated;
}

export function updatePayable(id, data) {
  const current = getPayables();
  const updated = current.map(p => p.id === id ? { ...p, ...data } : p);
  savePayables(updated);
  return updated;
}

export function deletePayable(id) {
  const current = getPayables();
  const updated = current.filter(p => p.id !== id);
  savePayables(updated);
  return updated;
}

export function registerPayablePayment(id, { amount, date, method }) {
  const current = getPayables();
  const payable = current.find(p => p.id === id);
  if(!payable) return { updated: current, error: 'Conta não encontrada.' };

  const { error } = validatePayment(payable, amount);
  if(error) return { updated: current, error };

  const amt        = Number(amount);
  const newPayment = { id: Date.now(), date, amount: amt, method };
  const newPaid    = (Number(payable.paidValue) || 0) + amt;

  const updated = current.map(p =>
    p.id === id
      ? { ...p, paidValue: newPaid, payments: [...(p.payments || []), newPayment] }
      : p
  );
  savePayables(updated);
  return { updated, error: null };
}

// -------- CENTRO DE CUSTOS --------

export function getCostCenters() {
  try {
    const stored = localStorage.getItem('cf_cost_centers');
    return stored ? JSON.parse(stored) : INITIAL_COST_CENTERS;
  } catch { return INITIAL_COST_CENTERS }
}

export function saveCostCenters(list) {
  localStorage.setItem('cf_cost_centers', JSON.stringify(list));
}

export function createCostCenter(data) {
  const current    = getCostCenters();
  const { error }  = validateCostCenter(data, current);
  if(error) return { updated: current, error };

  const newCenter = {
    id:          Date.now(),
    name:        data.name.trim(),
    type:        data.type,
    budget:      Number(data.budget),
    description: (data.description || '').trim(),
    categories:  Array.isArray(data.categories) ? data.categories : [],
  };

  const updated = [newCenter, ...current];
  saveCostCenters(updated);
  return { updated, error: null };
}

export function updateCostCenter(id, data) {
  const current   = getCostCenters();
  const center    = current.find(c => c.id === id);
  if(!center) return { updated: current, error: 'Centro não encontrado.' };

  const { error } = validateCostCenter(data, current, id);
  if(error) return { updated: current, error };

  const updated = current.map(c => c.id === id ? {
    ...c,
    name:        data.name.trim(),
    type:        data.type,
    budget:      Number(data.budget),
    description: (data.description || '').trim(),
    categories:  Array.isArray(data.categories) ? data.categories : c.categories,
  } : c);

  saveCostCenters(updated);
  return { updated, error: null };
}

export function deleteCostCenter(id) {
  const current = getCostCenters();
  const center  = current.find(c => c.id === id);
  if(!center) return { updated: current, error: 'Centro não encontrado.' };

  const linked = getPayables().filter(p => (center.categories || []).includes(p.category));
  if(linked.length > 0) {
    return {
      updated: current,
      error: `Não é possível excluir: existem ${linked.length} transação(ões) vinculada(s) a este centro.`,
    };
  }

  const updated = current.filter(c => c.id !== id);
  saveCostCenters(updated);
  return { updated, error: null };
}

export function getCostCenterAnalysis(id) {
  const center = getCostCenters().find(c => c.id === id);
  if(!center) return null;
  return computeCostCenterAnalysis(center, getPayables());
}

export function getCostCentersMonthlyVariation() {
  return computeCostCentersMonthlyVariation(getCostCenters(), getPayables());
}
