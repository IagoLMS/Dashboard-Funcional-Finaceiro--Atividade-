import { PrismaClient } from '@prisma/client';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join }                from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma    = new PrismaClient();

const seedPath = join(__dirname, '../../frontend/src/data/seed');

const { INITIAL_CASH_FLOW }    = await import(pathToFileURL(join(seedPath, 'cashflow.seed.js')).href);
const { INITIAL_RECEIVABLES }  = await import(pathToFileURL(join(seedPath, 'receivables.seed.js')).href);
const { INITIAL_PAYABLES }     = await import(pathToFileURL(join(seedPath, 'payables.seed.js')).href);
const { INITIAL_COST_CENTERS } = await import(pathToFileURL(join(seedPath, 'costCenters.seed.js')).href);

async function main() {
  console.log('Seeding database...');

  await prisma.cashFlowEntry.deleteMany();
  for(const e of INITIAL_CASH_FLOW) {
    await prisma.cashFlowEntry.create({
      data: {
        date:        e.date,
        description: e.description,
        category:    e.category,
        type:        e.type,
        value:       e.value,
        status:      e.status,
        origin:      e.origin,
        observation: e.observation || '',
      },
    });
  }
  console.log(`  ✓ CashFlowEntry: ${INITIAL_CASH_FLOW.length} records`);

  await prisma.receivablePayment.deleteMany();
  await prisma.receivable.deleteMany();
  for(const r of INITIAL_RECEIVABLES) {
    await prisma.receivable.create({
      data: {
        client:      r.client,
        origin:      r.origin || '',
        totalValue:  r.totalValue,
        paidValue:   r.paidValue,
        issueDate:   r.issueDate,
        dueDate:     r.dueDate,
        observation: r.observation || '',
        payments: {
          create: (r.payments || []).map(p => ({
            date:   p.date,
            amount: p.amount,
            method: p.method,
          })),
        },
      },
    });
  }
  console.log(`  ✓ Receivable: ${INITIAL_RECEIVABLES.length} records`);

  await prisma.payablePayment.deleteMany();
  await prisma.payable.deleteMany();
  for(const p of INITIAL_PAYABLES) {
    await prisma.payable.create({
      data: {
        supplier:    p.supplier,
        origin:      p.origin,
        category:    p.category,
        totalValue:  p.totalValue,
        paidValue:   p.paidValue,
        issueDate:   p.issueDate,
        dueDate:     p.dueDate,
        observation: p.observation || '',
        payments: {
          create: (p.payments || []).map(pay => ({
            date:   pay.date,
            amount: pay.amount,
            method: pay.method,
          })),
        },
      },
    });
  }
  console.log(`  ✓ Payable: ${INITIAL_PAYABLES.length} records`);

  await prisma.costCenter.deleteMany();
  for(const c of INITIAL_COST_CENTERS) {
    await prisma.costCenter.create({
      data: {
        name:        c.name,
        type:        c.type,
        budget:      c.budget,
        description: c.description || '',
        categories:  JSON.stringify(c.categories || []),
      },
    });
  }
  console.log(`  ✓ CostCenter: ${INITIAL_COST_CENTERS.length} records`);

  console.log('Seeding complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
