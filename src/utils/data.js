export const KPI_DATA = {
  receita: 75000,
  despesas: 30000,
  lucro: 45000,
  margem: 60,
  receitaTrend: +8,
  custosTrend: -5,
}

export const MONTHLY_DATA = [
  { mes: 'Nov', receita: 62000, despesas: 34000, lucro: 28000 },
  { mes: 'Dez', receita: 58000, despesas: 31000, lucro: 27000 },
  { mes: 'Jan', receita: 65000, despesas: 28000, lucro: 37000 },
  { mes: 'Fev', receita: 70000, despesas: 32000, lucro: 38000 },
  { mes: 'Mar', receita: 69000, despesas: 35000, lucro: 34000 },
  { mes: 'Abr', receita: 75000, despesas: 30000, lucro: 45000 },
]

export const DEPARTMENTS = [
  { name: 'Produção', value: 12000 },
  { name: 'Logística', value: 7500 },
  { name: 'Compras', value: 6200 },
  { name: 'RH', value: 4300 },
]

const INITIAL_USERS = [
  { id: 1, name: 'Ana Rodrigues', email: 'admin@empresa.com', role: 'admin', department: 'TI' },
  { id: 2, name: 'Carlos Mendes', email: 'gestor@empresa.com', role: 'gestor', department: 'Compras' },
  { id: 3, name: 'Beatriz Lima', email: 'viewer@empresa.com', role: 'viewer', department: 'RH' },
  { id: 4, name: 'Fernando Costa', email: 'fernando@empresa.com', role: 'gestor', department: 'Logística' },
  { id: 5, name: 'Mariana Souza', email: 'mariana@empresa.com', role: 'viewer', department: 'Produção' },
]

export function getUsers() {
  try {
    const stored = localStorage.getItem('cf_users')
    return stored ? JSON.parse(stored) : INITIAL_USERS
  } catch { return INITIAL_USERS }
}

export function saveUsers(users) {
  localStorage.setItem('cf_users', JSON.stringify(users))
}

export const ROLE_LABELS = { admin: 'Administrador', gestor: 'Gestor', viewer: 'Visualizador' }
export const DEPT_LIST = ['Produção', 'Logística', 'Compras', 'RH', 'TI']
