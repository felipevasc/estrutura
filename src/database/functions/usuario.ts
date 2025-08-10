import prisma from "..";
import { Prisma } from '@prisma/client';

export type TipoUsuario = Prisma.UsuarioCreateInput;

export const adicionarUsuarios = async (usuarios: string[], projetoId: number) => {
  const usuariosAdicionados = [];
  for (const nomeUsuario of usuarios) {
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        nome: nomeUsuario,
        projetoId: projetoId,
      },
    });

    if (!usuarioExistente) {
      const novoUsuario = await prisma.usuario.create({
        data: {
          nome: nomeUsuario,
          projeto: {
            connect: {
              id: projetoId,
            },
          },
        },
      });
      usuariosAdicionados.push(novoUsuario);
    }
  }
  return usuariosAdicionados;
};
