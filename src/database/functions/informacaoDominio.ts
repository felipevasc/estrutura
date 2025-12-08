import prisma from "..";

export type RegistroInformacaoDominio = {
  dominioId: number;
  campo: string;
  valor: string;
};

const normalizar = (registro: RegistroInformacaoDominio) => ({
  ...registro,
  campo: registro.campo.trim(),
  valor: registro.valor.trim(),
});

export const salvarInformacoesDominio = async (informacoes: RegistroInformacaoDominio[]) => {
  const itens = informacoes
    .map(normalizar)
    .filter((registro) => registro.campo.length > 0 && registro.valor.length > 0);

  if (!itens.length) return [];

  await Promise.all(itens.map(async (registro) => {
    await prisma.informacaoDominio.upsert({
      where: { dominioId_campo: { dominioId: registro.dominioId, campo: registro.campo } },
      update: { valor: registro.valor },
      create: registro,
    });
  }));

  return prisma.informacaoDominio.findMany({ where: { dominioId: itens[0].dominioId } });
};
