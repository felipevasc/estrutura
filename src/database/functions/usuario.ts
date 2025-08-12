import prisma from "..";

export type TipoUsuario = {
  nome: string;
};

export const adicionarUsuarios = async (usuarios: TipoUsuario[], ipId: number) => {
  const usuariosExistentes = await prisma.usuario.findMany({
    where: { ipId },
  });
  const novosUsuarios = usuarios.filter((u, i, arr) => arr.findIndex(e => e.nome === u.nome) === i)
  for (let i = 0; i < novosUsuarios.length; i++) {
    const nome = usuarios[i].nome;
    const usuarioAtual = usuariosExistentes.find(u => u.nome === nome);
    if (!usuarioAtual && nome) {
      await prisma.usuario.create({
        data: { nome, ipId },
      });
    }
  }
};
