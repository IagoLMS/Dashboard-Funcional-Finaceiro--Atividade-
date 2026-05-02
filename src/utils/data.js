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

// -------- CONTAS A RECEBER --------

export const RECEIVABLE_CLIENTS = [
  'EcoStore Ltda',
  'GreenPath Soluções',
  'Natura & Cia',
  'BioMar Ind.',
  'Renovar Comércio',
  'SustentaTech',
  'Planeta Verde SA',
  'AgroEco Brasil',
  'ReciclaMax',
  'EcoPack Embalagens',
];

/**
 * Computes the status of a receivable based on business rules:
 *  - balance == 0        → 'paid'
 *  - overdue + balance>0 → 'overdue'
 *  - not yet due         → 'pending'
 */
export function computeReceivableStatus(receivable) {
  const balance = (Number(receivable.totalValue) || 0) - (Number(receivable.paidValue) || 0);
  if(balance <= 0) return 'paid';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(receivable.dueDate + 'T00:00:00');
  if(due < today) return 'overdue';

  return 'pending';
}

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  
  return d.toISOString().slice(0, 10);
};

const INITIAL_RECEIVABLES = [
  {
    id: 101,
    client: 'EcoStore Ltda',
    origin: 'Pedido #1042',
    totalValue: 18500,
    paidValue: 18500,
    issueDate: '2025-04-01',
    dueDate: '2025-04-15',
    observation: 'Pagamento antecipado',
    payments: [
      { id: 9001, date: '2025-04-10', amount: 18500, method: 'transferência' },
    ],
  },
  {
    id: 102,
    client: 'GreenPath Soluções',
    origin: 'Contrato #GP-07',
    totalValue: 7800,
    paidValue: 3000,
    issueDate: '2025-04-05',
    dueDate: '2025-04-20',
    observation: 'Pagamento parcial recebido',
    payments: [
      { id: 9002, date: '2025-04-15', amount: 3000, method: 'transferência' },
    ],
  },
  {
    id: 103,
    client: 'Natura & Cia',
    origin: 'NF-e 3812',
    totalValue: 22000,
    paidValue: 0,
    issueDate: '2025-03-20',
    dueDate: '2025-04-05',
    observation: '',
    payments: [],
  },
  {
    id: 104,
    client: 'BioMar Ind.',
    origin: 'Pedido #1058',
    totalValue: 11200,
    paidValue: 0,
    issueDate: '2025-05-01',
    dueDate: '2025-05-20',
    observation: 'Linha premium',
    payments: [],
  },
  {
    id: 105,
    client: 'ReciclaMax',
    origin: 'Workshop Abril',
    totalValue: 3500,
    paidValue: 3500,
    issueDate: '2025-04-28',
    dueDate: '2025-04-30',
    observation: '35 participantes',
    payments: [
      { id: 9003, date: '2025-04-29', amount: 3500, method: 'cartão' },
    ],
  },
  {
    id: 106,
    client: 'SustentaTech',
    origin: 'Serviço #ST-22',
    totalValue: 9200,
    paidValue: 0,
    issueDate: '2025-03-12',
    dueDate: '2025-03-30',
    observation: 'Inadimplente — 2ª cobrança enviada',
    payments: [],
  },
  {
    id: 107,
    client: 'EcoPack Embalagens',
    origin: 'NF-e 4021',
    totalValue: 15000,
    paidValue: 7500,
    issueDate: '2025-04-10',
    dueDate: '2025-05-10',
    observation: 'Parcela 1 recebida',
    payments: [
      { id: 9004, date: '2025-04-25', amount: 7500, method: 'transferência' },
    ],
  },
  {
    id: 108,
    client: 'AgroEco Brasil',
    origin: 'Pedido #1019',
    totalValue: 6400,
    paidValue: 0,
    issueDate: '2025-03-01',
    dueDate: '2025-03-18',
    observation: 'Em negociação',
    payments: [],
  },
];

export function getReceivables() {
  try {
    const stored = localStorage.getItem('cf_receivables');
    return stored ? JSON.parse(stored) : INITIAL_RECEIVABLES;
  } catch { return INITIAL_RECEIVABLES }
}

export function saveReceivables(list) {
  localStorage.setItem('cf_receivables', JSON.stringify(list));
}

/**
 * Creates one or multiple receivable records.
 * Ifinstallments > 1, generates one record per installment.
 */
export function createReceivable(data) {
  const current = getReceivables();
  const installments = Number(data.installments) || 1;
  const perValue = parseFloat((Number(data.totalValue) / installments).toFixed(2));
  const newEntries = [];

  for (let i = 0; i < installments; i++) {
    const dueDate = addDays(data.dueDate, i * 30);
    newEntries.push({
      id: Date.now() + i,
      client: data.client,
      origin: data.origin || '',
      totalValue: perValue,
      paidValue: 0,
      issueDate: today(),
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

/**
 * Registers a payment against a receivable.
 * Validates that amount does not exceed balance.
 * Returns { updated, error } tuple.
 */
export function registerPayment(id, { amount, date, method }) {
  const current = getReceivables();
  const receivable = current.find(r => r.id === id);
  if(!receivable) return { updated: current, error: 'Conta não encontrada.' };

  const balance = (Number(receivable.totalValue) || 0) - (Number(receivable.paidValue) || 0);
  const amt = Number(amount) || 0;
  if(amt <= 0) return { updated: current, error: 'Valor deve ser maior que zero.' };
  if(amt > balance) return { updated: current, error: 'Valor não pode ultrapassar o saldo restante.' };

  const newPayment = { id: Date.now(), date, amount: amt, method };
  const newPaid = (Number(receivable.paidValue) || 0) + amt;

  const updated = current.map(r =>
    r.id === id
      ? { ...r, paidValue: newPaid, payments: [...(r.payments || []), newPayment] }
      : r
  );
  saveReceivables(updated);
  return { updated, error: null };
}
