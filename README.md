# Dashboard Financeiro — Start Solidarium

Dashboard financeiro full-stack com suporte a dois modos de dados: **Demo (mock)** e **Produção (API + SQLite)**.

## Estrutura do Projeto

```
/
├── frontend/          # React + Vite + Tailwind
└── backend/           # Express + Prisma + SQLite
```

---

## Pré-requisitos

- Node.js 18+
- npm 9+

---

## Rodando em desenvolvimento

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
# Acesse: http://localhost:5173
```

### 2. Backend

```bash
cd backend
npm install

# Criar banco e rodar migrations
npx prisma migrate dev

# Popular com dados iniciais
node prisma/seed.js

# Iniciar servidor
npm run dev
# API disponível em: http://localhost:3001
# Health check: http://localhost:3001/api/health
```

---

## Alternando o modo de dados

Na página **Dashboard**, use o toggle **"Demo / Produção"**:

| Modo     | Fonte de dados                        | Persistência             |
|----------|---------------------------------------|--------------------------|
| Demo     | Seeds em memória (sessionStorage)     | Efêmera — some ao fechar |
| Produção | API REST → Express → SQLite (dev.db)  | Permanente               |

> **Segurança de isolamento:** o modo Demo usa `sessionStorage` com prefixo `mock:` e **nunca** escreve no banco.
> Dados de produção não são afetados por operações no modo Demo.

---

## Inspecionar banco de dados (Produção)

```bash
cd backend
npx prisma studio
# Interface web em: http://localhost:5555
```

---

## Endpoints REST

| Recurso        | Base                    |
|----------------|-------------------------|
| Payables       | `GET/POST/PATCH/DELETE /api/payables` |
| Receivables    | `GET/POST/PATCH/DELETE /api/receivables` |
| CashFlow       | `GET/POST/PATCH/DELETE /api/cashflow` |
| Cost Centers   | `GET/POST/PATCH/DELETE /api/cost-centers` |
| Dashboard      | `GET /api/dashboard/kpis` · `/monthly` · `/departments` |
| Health         | `GET /api/health` |

---

## Tecnologias

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, jsPDF, lucide-react

**Backend:** Node.js, Express 4, Prisma ORM, SQLite, Zod, Morgan

---

## Melhorias futuras

- Auth real (JWT + tabela User no banco)
- React Query / TanStack Query (cache, revalidação, optimistic updates)
- TypeScript (backend primeiro, depois frontend)
- Testes: Vitest (backend services) + React Testing Library
- Trocar SQLite por PostgreSQL em produção
- Audit log de alterações
