import prisma from './prismaClient.js';

const include = { payments: true };

export const payablesRepository = {
  findAll: () => prisma.payable.findMany({ include }),

  findById: (id) => prisma.payable.findUnique({ where: { id }, include }),

  create: (data) => prisma.payable.create({ data, include }),

  update: (id, data) => prisma.payable.update({ where: { id }, data, include }),

  delete: (id) => prisma.payable.delete({ where: { id } }),

  createPayment: (payableId, paymentData) =>
    prisma.payablePayment.create({
      data: { ...paymentData, payableId },
    }),

  updatePaidValue: (id, paidValue) =>
    prisma.payable.update({ where: { id }, data: { paidValue }, include }),
};
