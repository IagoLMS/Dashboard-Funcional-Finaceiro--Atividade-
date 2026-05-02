import prisma from './prismaClient.js';

const include = { payments: true };

export const receivablesRepository = {
  findAll:   ()    => prisma.receivable.findMany({ include }),
  findById:  (id)  => prisma.receivable.findUnique({ where: { id }, include }),
  create:    (data) => prisma.receivable.create({ data, include }),
  update:    (id, data) => prisma.receivable.update({ where: { id }, data, include }),
  delete:    (id)  => prisma.receivable.delete({ where: { id } }),
  createPayment: (receivableId, paymentData) =>
    prisma.receivablePayment.create({ data: { ...paymentData, receivableId } }),
  updatePaidValue: (id, paidValue) =>
    prisma.receivable.update({ where: { id }, data: { paidValue }, include }),
};
