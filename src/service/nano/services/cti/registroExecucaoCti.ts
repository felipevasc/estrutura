import { inspect } from 'node:util';

export const linhaComandoCti = (comando: string, detalhes?: unknown) => {
  if (Array.isArray(detalhes)) {
    const texto = detalhes.map((item) => String(item)).filter(Boolean).join(' ');
    return texto ? `${comando} ${texto}` : comando;
  }
  if (typeof detalhes === 'string') return detalhes ? `${comando} ${detalhes}` : comando;
  if (!detalhes) return comando;
  const texto = JSON.stringify(detalhes);
  if (texto && texto !== '{}') return `${comando} ${texto}`;
  return comando;
};

export const saidaBrutaCti = (conteudo: unknown) => {
  if (conteudo === undefined || conteudo === null) return '';
  if (typeof conteudo === 'string') return conteudo;
  try {
    return JSON.stringify(conteudo, null, 2);
  } catch {
    return inspect(conteudo);
  }
};
