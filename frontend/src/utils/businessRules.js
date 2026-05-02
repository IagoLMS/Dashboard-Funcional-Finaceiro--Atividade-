const today = () => new Date().toISOString().slice(0, 10);

export const addDays = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export { today };

/**
 * Computes receivable status from business rules:
 *  - balance == 0        → 'paid'
 *  - overdue + balance>0 → 'overdue'
 *  - not yet due         → 'pending'
 */
export function computeReceivableStatus(receivable) {
  const balance = (Number(receivable.totalValue) || 0) - (Number(receivable.paidValue) || 0);
  if(balance <= 0) return 'paid';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(receivable.dueDate + 'T00:00:00');
  if(due < now) return 'overdue';

  return 'pending';
}

/**
 * Computes payable status from business rules:
 *  - balance == 0        → 'paid'
 *  - overdue + balance>0 → 'overdue'
 *  - not yet due         → 'pending'
 */
export function computePayableStatus(payable) {
  const balance = (Number(payable.totalValue) || 0) - (Number(payable.paidValue) || 0);
  if(balance <= 0) return 'paid';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(payable.dueDate + 'T00:00:00');
  if(due < now) return 'overdue';

  return 'pending';
}

/**
 * Validates a payment registration against a record's balance.
 * Returns { error: string|null }.
 */
export function validatePayment(record, amount) {
  const balance = (Number(record.totalValue) || 0) - (Number(record.paidValue) || 0);
  const amt     = Number(amount) || 0;
  if(amt <= 0)      return { error: 'Valor deve ser maior que zero.' };
  if(amt > balance) return { error: 'Valor não pode ultrapassar o saldo restante.' };
  return { error: null };
}

/**
 * Validates a cost center payload.
 * Returns { error: string|null }.
 */
export function validateCostCenter(data, existing, ignoreId = null) {
  if(!data.name?.trim())       return { error: 'Nome é obrigatório.' };
  if(!data.type)               return { error: 'Tipo é obrigatório.' };
  if(Number(data.budget) <= 0) return { error: 'Orçamento deve ser maior que zero.' };

  const duplicate = existing.some(c =>
    c.id !== ignoreId &&
    c.name.trim().toLowerCase() === data.name.trim().toLowerCase()
  );
  if(duplicate) return { error: 'Já existe um centro de custo com este nome.' };

  return { error: null };
}

/**
 * Returns the analytical breakdown of a cost center given its payables.
 */
export function computeCostCenterAnalysis(center, payables) {
  const linked = payables
    .filter(p => (center.categories || []).includes(p.category))
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

  const currentCost = linked.reduce((s, p) => s + (Number(p.totalValue) || 0), 0);
  const paidCost    = linked.reduce((s, p) => s + (Number(p.paidValue)  || 0), 0);
  const budget      = Number(center.budget) || 0;
  const percentage  = budget > 0 ? (currentCost / budget) : 0;

  let status = 'within';
  if(percentage > 1)        status = 'over';
  else if(percentage > 0.8) status = 'warning';

  const monthlyMap = {};
  linked.forEach(p => {
    if(!p.issueDate) return;
    const d   = new Date(p.issueDate + 'T00:00:00');
    const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    if(!monthlyMap[key]) monthlyMap[key] = { mes: key, custo: 0, sortKey: d.getFullYear() * 12 + d.getMonth() };
    monthlyMap[key].custo += Number(p.totalValue) || 0;
  });

  const monthlyEvolution = Object.values(monthlyMap)
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey: _sk, ...rest }) => rest);

  const transactions = linked.map(p => ({
    id:          p.id,
    date:        p.issueDate,
    origin:      p.supplier,
    category:    p.category,
    value:       Number(p.totalValue) || 0,
    paid:        Number(p.paidValue)  || 0,
    description: p.observation || '',
  }));

  return {
    center,
    paidCost,
    currentCost,
    percentage,
    status,
    transactions,
    monthlyEvolution,
    difference: currentCost - budget,
  };
}

/**
 * Computes monthly cost variation across all cost centers.
 */
export function computeCostCentersMonthlyVariation(costCenters, payables) {
  const linkedCategories = new Set(costCenters.flatMap(c => c.categories || []));

  const now      = new Date();
  const curMonth = now.getMonth();
  const curYear  = now.getFullYear();
  const prev     = new Date(curYear, curMonth - 1, 1);

  const sumByMonth = (m, y) => payables
    .filter(p => linkedCategories.has(p.category))
    .filter(p => {
      if(!p.issueDate) return false;
      const d = new Date(p.issueDate + 'T00:00:00');
      return d.getMonth() === m && d.getFullYear() === y;
    })
    .reduce((s, p) => s + (Number(p.totalValue) || 0), 0);

  const current  = sumByMonth(curMonth, curYear);
  const previous = sumByMonth(prev.getMonth(), prev.getFullYear());
  const variation = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return { current, previous, variation };
}
