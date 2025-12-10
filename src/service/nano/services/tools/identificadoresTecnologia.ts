import fs from 'node:fs';

export type RespostaTecnologia = {
  url: string;
  status: number | null;
  cabecalhos: Record<string, string>;
  corpo: string;
  cookies: string[];
  caminho: string;
};

type Evidencia = { nome: string; evidencias: string[] };

const registrar = (mapa: Map<string, Set<string>>, nome: string, evidencia: string) => {
  if (!mapa.has(nome)) mapa.set(nome, new Set());
  mapa.get(nome)?.add(evidencia);
};

const normalizarTexto = (valor: string) => valor.toLowerCase();

const caminhoDaUrl = (alvo: string) => {
  try {
    const url = new URL(alvo);
    return url.pathname || '/';
  } catch {
    return '/';
  }
};

export const coletarRespostaTecnologia = async (alvo: string): Promise<RespostaTecnologia> => {
  const resposta = await fetch(alvo, { redirect: 'follow' });
  const cabecalhos: Record<string, string> = {};
  resposta.headers.forEach((valor, chave) => {
    cabecalhos[chave.toLowerCase()] = valor;
  });
  const cookies = typeof (resposta.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie === 'function'
    ? resposta?.headers?.getSetCookie() ?? []
    : [];
  const corpoCompleto = await resposta.text();
  const corpo = corpoCompleto.slice(0, 20000);
  const url = resposta.url || alvo;
  return { url, status: resposta.status ?? null, cabecalhos, corpo, cookies, caminho: caminhoDaUrl(url) };
};

export const detectarLinguagens = (dados: RespostaTecnologia): Evidencia[] => {
  const mapa = new Map<string, Set<string>>();
  const cabecalhos = normalizarTexto(Object.values(dados.cabecalhos).join(' '));
  const cookies = normalizarTexto(dados.cookies.join(' '));
  const corpo = normalizarTexto(dados.corpo);
  const caminho = normalizarTexto(dados.caminho);
  const contexto = `${cabecalhos} ${cookies} ${corpo}`;

  if (/php/.test(contexto) || /phpsessid/.test(cookies) || /\.php(\b|[?#])/.test(caminho)) registrar(mapa, 'PHP', 'Assinatura PHP');
  if (/laravel/.test(contexto) || /october/.test(contexto)) registrar(mapa, 'PHP', 'Ecossistema PHP');
  if (/node\.js|express|next\.js/.test(contexto)) registrar(mapa, 'JavaScript', 'Assinatura Node');
  if (/typescript/.test(contexto)) registrar(mapa, 'JavaScript', 'Assinatura TypeScript');
  if (/python|wsgi|flask|django/.test(contexto)) registrar(mapa, 'Python', 'Assinatura Python');
  if (/ruby|rails|rack/.test(contexto) || /_rails_session/.test(cookies)) registrar(mapa, 'Ruby', 'Assinatura Ruby');
  if (/java/.test(contexto) || /jsp/.test(contexto) || /servlet/.test(contexto) || /jsessionid/.test(contexto)) registrar(mapa, 'Java', 'Assinatura Java');
  if (/asp\.net|aspx/.test(contexto) || /x-aspnet-version/.test(cabecalhos)) registrar(mapa, '.NET', 'Assinatura .NET');
  if (/golang|go-http/.test(contexto)) registrar(mapa, 'Go', 'Assinatura Go');
  if (/perl|pl\b/.test(contexto)) registrar(mapa, 'Perl', 'Assinatura Perl');

  return Array.from(mapa.entries()).map(([nome, evidencias]) => ({ nome, evidencias: Array.from(evidencias) }));
};

export const detectarFrameworks = (dados: RespostaTecnologia): Evidencia[] => {
  const mapa = new Map<string, Set<string>>();
  const cabecalhos = normalizarTexto(Object.values(dados.cabecalhos).join(' '));
  const cookies = normalizarTexto(dados.cookies.join(' '));
  const corpo = normalizarTexto(dados.corpo);
  const caminho = normalizarTexto(dados.caminho);
  const contexto = `${cabecalhos} ${cookies} ${corpo}`;

  if (/wp-content|wp-includes|wordpress|wp-json/.test(contexto) || /wp-/.test(caminho)) registrar(mapa, 'WordPress', 'Assinatura WordPress');
  if (/drupal/.test(contexto)) registrar(mapa, 'Drupal', 'Assinatura Drupal');
  if (/joomla/.test(contexto)) registrar(mapa, 'Joomla', 'Assinatura Joomla');
  if (/magento/.test(contexto)) registrar(mapa, 'Magento', 'Assinatura Magento');
  if (/shopify/.test(contexto)) registrar(mapa, 'Shopify', 'Assinatura Shopify');
  if (/laravel/.test(contexto) || /laravel_session/.test(cookies) || /xsrf-token/.test(cookies)) registrar(mapa, 'Laravel', 'Assinatura Laravel');
  if (/django/.test(contexto) || /csrftoken/.test(cookies) || /sessionid/.test(cookies)) registrar(mapa, 'Django', 'Assinatura Django');
  if (/flask|werkzeug/.test(contexto)) registrar(mapa, 'Flask', 'Assinatura Flask');
  if (/express/.test(contexto)) registrar(mapa, 'Express', 'Assinatura Express');
  if (/next\.js|__next_data__/.test(contexto)) registrar(mapa, 'Next.js', 'Assinatura Next.js');
  if (/rails|_rails_session/.test(contexto) || /x-runtime/.test(cabecalhos)) registrar(mapa, 'Rails', 'Assinatura Rails');
  if (/spring/.test(contexto) || /jsessionid/.test(cookies)) registrar(mapa, 'Spring', 'Assinatura Spring');
  if (/asp\.net|aspx/.test(contexto)) registrar(mapa, 'ASP.NET', 'Assinatura ASP.NET');
  if (/strapi/.test(contexto)) registrar(mapa, 'Strapi', 'Assinatura Strapi');

  return Array.from(mapa.entries()).map(([nome, evidencias]) => ({ nome, evidencias: Array.from(evidencias) }));
};

export const registrarLogResposta = (caminho: string, dados: RespostaTecnologia) => {
  fs.writeFileSync(caminho, JSON.stringify({
    url: dados.url,
    status: dados.status,
    cabecalhos: dados.cabecalhos,
    cookies: dados.cookies,
    corpo: dados.corpo,
    caminho: dados.caminho
  }, null, 2));
};
