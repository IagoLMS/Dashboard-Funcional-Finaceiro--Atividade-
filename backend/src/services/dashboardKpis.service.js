import { payablesRepository }   from '../repositories/payables.repository.js';
import { receivablesRepository } from '../repositories/receivables.repository.js';
import { cashflowRepository }    from '../repositories/cashflow.repository.js';

export const dashboardKpisService = {
  getKpis: async () => {
    const [payables, receivables, cashflow] = await Promise.all([
      payablesRepository.findAll(),
      receivablesRepository.findAll(),
      cashflowRepository.findAll(),
    ]);

    const now     = new Date();
    const month   = now.getMonth();
    const year    = now.getFullYear();

    const isThisMonth = (dateStr) => {
      if(!dateStr) return false;
      const d = new Date(dateStr + 'T00:00:00');
      return d.getMonth() === month && d.getFullYear() === year;
    };

    const receita  = cashflow
      .filter(e => e.type === 'income' && isThisMonth(e.date))
      .reduce((s, e) => s + e.value, 0);

    const despesas = cashflow
      .filter(e => e.type === 'expense' && isThisMonth(e.date))
      .reduce((s, e) => s + e.value, 0);

    const lucro    = receita - despesas;
    const margem   = receita > 0 ? parseFloat(((lucro / receita) * 100).toFixed(1)) : 0;

    return { receita, despesas, lucro, margem, receitaTrend: 0, custosTrend: 0 };
  },

  getMonthly: async () => {
    const cashflow = await cashflowRepository.findAll();
    const map = {};
    cashflow.forEach(e => {
      const d   = new Date(e.date + 'T00:00:00');
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if(!map[key]) map[key] = { mes: key, receita: 0, despesas: 0, lucro: 0, sortKey: d.getFullYear() * 12 + d.getMonth() };
      if(e.type === 'income')  map[key].receita  += e.value;
      if(e.type === 'expense') map[key].despesas += e.value;
    });
    return Object.values(map)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ sortKey: _sk, ...rest }) => ({ ...rest, lucro: rest.receita - rest.despesas }));
  },

  getDepartments: async () => {
    const payables = await payablesRepository.findAll();
    const map = {};
    payables.forEach(p => {
      if(!map[p.category]) map[p.category] = { name: p.category, value: 0 };
      map[p.category].value += Number(p.totalValue) || 0;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  },
};
