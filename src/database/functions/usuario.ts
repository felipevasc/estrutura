import prisma from "..";

export type TipoUsuario = {
  nome: string;
};

export const adicionarUsuarios = async (usuarios: TipoUsuario[], ipId: number) => {
  const usuariosExistentes = await prisma.usuario.findMany({
    where: { ipId },
  });
  for (let i = 0; i < usuarios.length; i++) {
    const nome = usuarios[i].nome;
    const usuarioAtual = usuariosExistentes.find(u => u.nome === nome);
    if (!usuarioAtual && nome) {
      await prisma.usuario.create({
        data: { nome, ipId },
      });
    }
  }
};
