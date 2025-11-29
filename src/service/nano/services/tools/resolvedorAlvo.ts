import prisma from '@/database';
import { Prisma } from '@prisma/client';

type Dominio = Prisma.DominioGetPayload<{ select: { id: true; endereco: true } }>;
type Ip = Prisma.IpGetPayload<{ select: { id: true; endereco: true } }>;
type DiretorioComRelacionamentos = Prisma.DiretorioGetPayload<{
  select: {
    id: true;
    caminho: true;
    dominio: { select: { id: true; endereco: true } };
    ip: { select: { id: true; endereco: true } };
  };
}>;

export type AlvoResolvido = {
  dominio: Dominio | null;
  ip: Ip | null;
  alvo: string;
  caminhoBase: string;
};

export const resolverAlvo = async (args: Record<string, unknown>): Promise<AlvoResolvido> => {
  const idDiretorio = extrairNumero(args.idDiretorio);
  const idDominio = extrairNumero(args.idDominio);
  const idIp = extrairNumero(args.idIp);

  const diretorio = idDiretorio
    ? await prisma.diretorio.findUnique({
        where: { id: idDiretorio },
        select: {
          id: true,
          caminho: true,
          dominio: { select: { id: true, endereco: true } },
          ip: { select: { id: true, endereco: true } }
        }
      })
    : null;

  const dominio = diretorio?.dominio
    ? diretorio.dominio
    : idDominio
      ? await prisma.dominio.findUnique({ select: { id: true, endereco: true }, where: { id: idDominio } })
      : null;

  const ip = diretorio?.ip
    ? diretorio.ip
    : idIp
      ? await prisma.ip.findUnique({ select: { id: true, endereco: true }, where: { id: idIp } })
      : null;

  if (!dominio && !ip) throw new Error('Alvo não encontrado');

  const base = dominio ? dominio.endereco : ip?.endereco ?? '';
  if (!base) throw new Error('Alvo inválido');

  const caminhoBase = normalizarCaminhoBase(diretorio, args.caminhoBase);
  const endereco = base.startsWith('http') ? base : `http://${base}`;
  const alvo = caminhoBase ? `${endereco}${caminhoBase}` : endereco;

  return { dominio, ip, alvo, caminhoBase };
};

const extrairNumero = (valor: unknown) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};

const normalizarCaminhoBase = (diretorio: DiretorioComRelacionamentos | null, caminho: unknown) => {
  const base = diretorio?.caminho ?? (typeof caminho === 'string' ? caminho : '');
  if (!base) return '';
  return base.startsWith('/') ? base : `/${base}`;
};
