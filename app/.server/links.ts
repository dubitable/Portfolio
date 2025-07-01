import prisma from "./prisma";

export const getLinks = async () => {
  return await prisma.link.findMany();
};

export const addLink = async (link: string) => {
  return await prisma.link.create({ data: { link } });
};

export const deleteLink = async (id: string) => {
  return await prisma.link.delete({ where: { id } });
};
