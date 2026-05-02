import prisma from './prismaClient.js';

export const cashflowRepository = {
  findAll:  ()         => prisma.cashFlowEntry.findMany({ orderBy: { date: 'desc' } }),
  findById: (id)       => prisma.cashFlowEntry.findUnique({ where: { id } }),
  create:   (data)     => prisma.cashFlowEntry.create({ data }),
  update:   (id, data) => prisma.cashFlowEntry.update({ where: { id }, data }),
  delete:   (id)       => prisma.cashFlowEntry.delete({ where: { id } }),
};
