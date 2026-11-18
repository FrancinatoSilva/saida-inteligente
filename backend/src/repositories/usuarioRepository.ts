import { prisma } from '../database/prisma.js';

export const usuarioRepository = {
  findByUsername(usuario: string) {
    return prisma.usuario.findUnique({
      where: { usuario },
      select: {
        id: true,
        usuario: true,
        senhaHash: true,
        role: true,
        salaId: true,
        segmentoId: true,
      },
    });
  },
  findSala(id: number) {
    return prisma.sala.findUnique({
      where: { id },
      select: { serie: true, segmento: { select: { nome: true } } },
    });
  },
  findSegmento(id: number) {
    return prisma.segmento.findUnique({
      where: { id },
      select: { nome: true },
    });
  },
};
