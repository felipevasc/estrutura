const sanitizar = (texto: string) => texto.toLowerCase().replace(/https?:\/\//g, "").replace(/[^a-z0-9.-]/g, "").replace(/\.{2,}/g, ".").replace(/^-+|-+$/g, "").trim();

const palavrasFixas = ['xyz', 'inscricao', 'processo', 'online', 'mail', 'login', 'seguranca', 'verify', 'cloud', 'digital', 'app', 'id', 'conta', 'portal', 'auth'];

const normalizarPalavra = (valor: string) => valor.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "").trim();

const ignorarTlds = ['com', 'br', 'net', 'org', 'io', 'gov', 'edu', 'mil', 'biz', 'info', 'co', 'app', 'dev', 'site', 'online', 'store'];

const extrairPartesDominio = (endereco: string) => {
    const normalizado = sanitizar(endereco);
    return normalizado.split('.').map(item => item.trim()).filter(parte => parte && !ignorarTlds.includes(parte));
};

const gerarPalavrasSimples = (endereco: string) => {
    const partes = extrairPartesDominio(endereco);
    const base = new Set<string>();
    [...palavrasFixas, ...partes].forEach(item => {
        const termo = normalizarPalavra(item);
        if (termo) base.add(termo);
    });
    return Array.from(base);
};

const gerarTlds = (endereco: string) => {
    const normalizado = sanitizar(endereco);
    const partes = normalizado.split('.').filter(Boolean);
    const principal = partes.slice(-2).join('.') || partes.slice(-1)[0] || '';
    const curto = partes.slice(-1)[0] || '';
    const extras = ['com', 'net', 'org', 'io', 'br'];
    return Array.from(new Set([principal, curto, ...extras].map(item => item.replace(/^\./, "")).filter(Boolean)));
};

const gerarCombos = (palavras: string[]) => {
    const lista = Array.from(new Set(palavras.map(normalizarPalavra).filter(Boolean)));
    const combinacoes = new Set(lista);
    for (let i = 0; i < lista.length; i += 1) {
        for (let j = i + 1; j < lista.length; j += 1) {
            const dupla = [lista[i], lista[j]];
            const inversa = [lista[j], lista[i]];
            [dupla, inversa].forEach(par => {
                combinacoes.add(par.join(''));
                combinacoes.add(par.join('-'));
                combinacoes.add(par.join('.'));
            });
        }
    }
    return Array.from(combinacoes).slice(0, 240);
};

export const gerarDadosPhishing = (endereco: string) => {
    return { palavras: gerarPalavrasSimples(endereco), tlds: gerarTlds(endereco) };
};

export const gerarCombinacoesPhishing = (palavras: string[]) => gerarCombos(palavras);
