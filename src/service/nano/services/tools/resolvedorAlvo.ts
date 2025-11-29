import prisma from '@/database';

type DadosAlvo = {
  dominio: any;
  ip: any;
  alvo: string;
  caminhoBase: string;
};

export const resolverAlvo = async (args: any): Promise<DadosAlvo> => {
  let diretorio = null;
  let dominio = null;
  let ip = null;

  if (args.idDiretorio)
    diretorio = await prisma.diretorio.findUnique({ where: { id: parseInt(args.idDiretorio) }, include: { dominio: true, ip: true } });

  if (args.idDominio && !diretorio?.dominio) dominio = await prisma.dominio.findUnique({ where: { id: parseInt(args.idDominio) } });
  if (args.idIp && !diretorio?.ip) ip = await prisma.ip.findUnique({ where: { id: parseInt(args.idIp) } });

  const alvoDominio = diretorio?.dominio ?? dominio;
  const alvoIp = diretorio?.ip ?? ip;

  if (!alvoDominio && !alvoIp) throw new Error('Alvo não encontrado');

  const base = alvoDominio ? alvoDominio.endereco : alvoIp?.endereco ?? '';
  if (!base) throw new Error('Alvo inválido');

  const caminhoBase = diretorio?.caminho ?? args.caminhoBase ?? '';
  const caminhoNormalizado = caminhoBase ? (caminhoBase.startsWith('/') ? caminhoBase : `/${caminhoBase}`) : '';
  const endereco = base.startsWith('http') ? base : `http://${base}`;
  const alvo = caminhoNormalizado ? `${endereco}${caminhoNormalizado}` : endereco;

  return { dominio: alvoDominio, ip: alvoIp, alvo, caminhoBase: caminhoNormalizado };
};
