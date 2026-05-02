import { costCentersRepository as repo } from '../repositories/costCenters.repository.js';
import { payablesRepository }            from '../repositories/payables.repository.js';

function computeAnalysis(center, payables) {
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

  return { center, paidCost, currentCost, percentage, status, transactions, monthlyEvolution, difference: currentCost - budget };
}

function computeMonthlyVariation(centers, payables) {
  const linkedCategories = new Set(centers.flatMap(c => c.categories || []));
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
  return { current, previous, variation: previous > 0 ? ((current - previous) / previous) * 100 : 0 };
}

export const costCentersService = {
  list: () => repo.findAll(),

  getById: async (id) => {
    const c = await repo.findById(id);
    if(!c) throw Object.assign(new Error('Cost center not found'), { statusCode: 404 });
    return c;
  },

  create: async (data) => {
    const centers = await repo.findAll();
    const dup = centers.some(c => c.name.trim().toLowerCase() === data.name.trim().toLowerCase());
    if(dup) throw Object.assign(new Error('Já existe um centro de custo com este nome.'), { statusCode: 409 });
    return repo.create(data);
  },

  update: async (id, data) => {
    await costCentersService.getById(id);
    const centers = await repo.findAll();
    const dup = centers.some(c => c.id !== id && c.name.trim().toLowerCase() === data.name.trim().toLowerCase());
    if(dup) throw Object.assign(new Error('Já existe um centro de custo com este nome.'), { statusCode: 409 });
    return repo.update(id, data);
  },

  delete: async (id) => {
    const center   = await costCentersService.getById(id);
    const payables = await payablesRepository.findAll();
    const linked   = payables.filter(p => (center.categories || []).includes(p.category));
    if(linked.length > 0) throw Object.assign(
      new Error(`Não é possível excluir: existem ${linked.length} transação(ões) vinculada(s) a este centro.`),
      { statusCode: 409 }
    );
    await repo.delete(id);
  },

  getAnalysis: async (id) => {
    const center   = await costCentersService.getById(id);
    const payables = await payablesRepository.findAll();
    return computeAnalysis(center, payables);
  },

  getMonthlyVariation: async () => {
    const [centers, payables] = await Promise.all([repo.findAll(), payablesRepository.findAll()]);
    return computeMonthlyVariation(centers, payables);
  },
};
