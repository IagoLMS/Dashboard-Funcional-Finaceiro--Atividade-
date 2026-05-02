/**
 * Computes receivable status — mirrors frontend businessRules.js.
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
 * Computes payable status — mirrors frontend businessRules.js.
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
