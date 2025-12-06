const sanitizar = (texto: string) => texto.toLowerCase().replace(/https?:\/\//g, "").replace(/[^a-z0-9.-]/g, "").replace(/\.{2,}/g, ".").replace(/^-+|-+$/g, "").replace(/^\.+|\.+$/g, "").trim();

const gerarVariacoes = (partes: string[]) => {
    if (!partes.length) return [] as string[];
    const combinacoes = new Set<string>();
    const bases = [partes, partes.length > 1 ? [...partes].reverse() : partes];
    bases.forEach(lista => {
        combinacoes.add(lista.join('.'));
        combinacoes.add(lista.join(''));
        combinacoes.add(lista.join('-'));
    });
    return Array.from(combinacoes).filter(Boolean);
};

const gerarPalavrasChave = (partes: string[]) => {
    const palavras = new Set<string>();
    const adicionar = (valor: string) => { if (valor) palavras.add(sanitizar(valor)); };
    partes.forEach(adicionar);
    gerarVariacoes(partes).forEach(adicionar);
    const lista = Array.from(palavras).filter(Boolean);
    return lista.length ? lista.slice(0, 120) : lista;
};

const gerarPalavrasAuxiliares = () => {
    const sufixosExtras = ['xyz', 'inscricao', 'processo', 'online', 'mail', 'login', 'seguranca', 'verify', 'cloud', 'digital', 'app', 'id', 'portal', 'auth'];
    return Array.from(new Set(sufixosExtras.map(sanitizar).filter(Boolean)));
};

export const gerarTermosPhishing = (palavrasChave: string[], palavrasAuxiliares: string[]) => {
    const normalizar = (lista: string[]) => Array.from(new Set(lista.map(sanitizar).filter(Boolean)));
    const chaves = normalizar(palavrasChave);
    const auxiliares = normalizar(palavrasAuxiliares);
    const combinacoes = new Set<string>();
    chaves.forEach(chave => combinacoes.add(chave));
    chaves.forEach(chave => {
        auxiliares.forEach(auxiliar => {
            [[auxiliar, chave], [chave, auxiliar]].forEach(parte => {
                combinacoes.add(parte.join('.'));
                combinacoes.add(parte.join(''));
                combinacoes.add(parte.join('-'));
            });
        });
    });
    return Array.from(combinacoes);
};

export const gerarDadosPhishing = (endereco: string) => {
    const normalizado = sanitizar(endereco);
    const partes = normalizado.split('.').filter(Boolean);
    if (!partes.length) return { palavrasChave: [] as string[], palavrasAuxiliares: [] as string[], tlds: [] as string[] };

    const troncoBase = partes.length > 2 ? partes.slice(0, -2) : partes.slice(0, -1);
    const nucleos = troncoBase.length ? troncoBase : partes.slice(0, 1);
    const palavrasChave = gerarPalavrasChave(nucleos);
    if (!palavrasChave.length && nucleos.length) palavrasChave.push(sanitizar(nucleos[0]));

    const tldPrincipal = partes.slice(-2).join('.') || partes[partes.length - 1];
    const tldCurto = partes[partes.length - 1];
    const tlds = Array.from(new Set([tldPrincipal, tldCurto, "com", "net", "org", "io", "br"].filter(Boolean)));

    return { palavrasChave, palavrasAuxiliares: gerarPalavrasAuxiliares(), tlds };
};
