export const KPI_DATA = {
  margem:       60,
  lucro:        45000,
  receita:      75000,
  despesas:     30000,
  custosTrend:  -5,
  receitaTrend: +8,
};

export const MONTHLY_DATA = [
  { mes: 'Nov', receita: 62000, despesas: 34000, lucro: 28000 },
  { mes: 'Dez', receita: 58000, despesas: 31000, lucro: 27000 },
  { mes: 'Jan', receita: 65000, despesas: 28000, lucro: 37000 },
  { mes: 'Fev', receita: 70000, despesas: 32000, lucro: 38000 },
  { mes: 'Mar', receita: 69000, despesas: 35000, lucro: 34000 },
  { mes: 'Abr', receita: 75000, despesas: 30000, lucro: 45000 },
];

export const DEPARTMENTS = [
  { name: 'Produção',  value: 12000 },
  { name: 'Logística', value: 7500 },
  { name: 'Compras',   value: 6200 },
  { name: 'RH',        value: 4300 },
];

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

export const CASH_FLOW_CATEGORIES = [
  'Vendas',
  'Serviços',
  'Investimentos',
  'Fornecedores',
  'Salários',
  'Aluguel',
  'Impostos',
  'Marketing',
  'Manutenção',
  'Outros',
];

const INITIAL_CASH_FLOW = [
  { id: 1,  date: '2025-04-01', description: 'Venda de produtos sustentáveis',    category: 'Vendas',        type: 'income',  value: 18500, status: 'confirmed', origin: 'sistema',  observation: 'Pedido #1042' },
  { id: 2,  date: '2025-04-02', description: 'Pagamento de fornecedor EcoMat',    category: 'Fornecedores',  type: 'expense', value: 5200,  status: 'confirmed', origin: 'manual',   observation: '' },
  { id: 3,  date: '2025-04-03', description: 'Folha de pagamento — Abril',        category: 'Salários',      type: 'expense', value: 12000, status: 'confirmed', origin: 'sistema',  observation: 'Processado via RH' },
  { id: 4,  date: '2025-04-05', description: 'Consultoria ambiental',             category: 'Serviços',      type: 'income',  value: 7800,  status: 'confirmed', origin: 'manual',   observation: 'Projeto GreenPath' },
  { id: 5,  date: '2025-04-07', description: 'Aluguel galpão produção',           category: 'Aluguel',       type: 'expense', value: 3500,  status: 'confirmed', origin: 'sistema',  observation: '' },
  { id: 6,  date: '2025-04-10', description: 'Campanha marketing digital',        category: 'Marketing',     type: 'expense', value: 1800,  status: 'confirmed', origin: 'manual',   observation: 'Meta Ads Abril' },
  { id: 7,  date: '2025-04-12', description: 'Receita de serviços de reciclagem', category: 'Serviços',      type: 'income',  value: 9200,  status: 'confirmed', origin: 'sistema',  observation: '' },
  { id: 8,  date: '2025-04-15', description: 'Pagamento ICMS Abril',              category: 'Impostos',      type: 'expense', value: 4100,  status: 'confirmed', origin: 'sistema',  observation: '' },
  { id: 9,  date: '2025-04-18', description: 'Venda lote especial embalagens',    category: 'Vendas',        type: 'income',  value: 22000, status: 'confirmed', origin: 'manual',   observation: 'Cliente: EcoStore' },
  { id: 10, date: '2025-04-20', description: 'Manutenção equipamentos',           category: 'Manutenção',    type: 'expense', value: 2300,  status: 'pending',   origin: 'manual',   observation: 'Aguardando NF' },
  { id: 11, date: '2025-04-22', description: 'Aporte de investidor',              category: 'Investimentos', type: 'income',  value: 15000, status: 'confirmed', origin: 'manual',   observation: 'Rodada seed' },
  { id: 12, date: '2025-04-25', description: 'Compra matéria-prima reciclada',    category: 'Fornecedores',  type: 'expense', value: 6800,  status: 'pending',   origin: 'sistema',  observation: '' },
  { id: 13, date: '2025-04-28', description: 'Receita workshop sustentabilidade', category: 'Serviços',      type: 'income',  value: 3500,  status: 'confirmed', origin: 'manual',   observation: '35 participantes' },
  { id: 14, date: '2025-04-30', description: 'Despesas diversas administrativas', category: 'Outros',        type: 'expense', value: 900,   status: 'confirmed', origin: 'manual',   observation: '' },
  { id: 15, date: '2025-05-01', description: 'Venda produtos linha premium',      category: 'Vendas',        type: 'income',  value: 11200, status: 'pending',   origin: 'sistema',  observation: 'Pedido #1058' },
];

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
