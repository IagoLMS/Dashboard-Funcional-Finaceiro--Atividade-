import prisma from './prismaClient.js';

function parse(center) {
  return {
    ...center,
    categories: JSON.parse(center.categories || '[]'),
  };
}

export const costCentersRepository = {
  findAll:  async ()    => (await prisma.costCenter.findMany()).map(parse),
  findById: async (id)  => { const c = await prisma.costCenter.findUnique({ where: { id } }); return c ? parse(c) : null; },

  create: async (data) => {
    const c = await prisma.costCenter.create({
      data: {
        name:        data.name,
        type:        data.type,
        budget:      Number(data.budget),
        description: data.description || '',
        categories:  JSON.stringify(data.categories || []),
      },
    });
    return parse(c);
  },

  update: async (id, data) => {
    const c = await prisma.costCenter.update({
      where: { id },
      data: {
        name:        data.name,
        type:        data.type,
        budget:      Number(data.budget),
        description: data.description || '',
        categories:  JSON.stringify(data.categories || []),
      },
    });
    return parse(c);
  },

  delete: (id) => prisma.costCenter.delete({ where: { id } }),
};
