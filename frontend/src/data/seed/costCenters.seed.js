export const COST_CENTER_TYPES = [
  { value: 'operacional',    label: 'Operacional' },
  { value: 'administrativo', label: 'Administrativo' },
];

export const INITIAL_COST_CENTERS = [
  {
    id: 301,
    name: 'Produção',
    type: 'operacional',
    budget: 30000,
    description: 'Insumos, manutenção e fornecedores da linha produtiva.',
    categories: ['Fornecedores', 'Manutenção'],
  },
  {
    id: 302,
    name: 'Logística',
    type: 'operacional',
    budget: 18000,
    description: 'Investimentos em equipamentos e infraestrutura logística.',
    categories: ['Investimentos'],
  },
  {
    id: 303,
    name: 'Vendas e Marketing',
    type: 'operacional',
    budget: 12000,
    description: 'Campanhas, mídia paga e serviços de aquisição de clientes.',
    categories: ['Marketing', 'Serviços'],
  },
  {
    id: 304,
    name: 'Administrativo',
    type: 'administrativo',
    budget: 10000,
    description: 'Aluguel da sede, impostos e despesas operacionais.',
    categories: ['Aluguel', 'Impostos'],
  },
  {
    id: 305,
    name: 'Recursos Humanos',
    type: 'administrativo',
    budget: 25000,
    description: 'Folha de pagamento, benefícios e encargos.',
    categories: ['Salários'],
  },
];
