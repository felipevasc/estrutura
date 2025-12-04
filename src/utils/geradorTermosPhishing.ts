const sanitizar = (texto: string) => texto.toLowerCase().replace(/https?:\/\//g, "").replace(/[^a-z0-9.-]/g, "").replace(/\.{2,}/g, ".").replace(/^-+|-+$/g, "").trim();

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

const gerarPalavras = (partes: string[]) => {
    const palavras = new Set<string>();
    const sufixosExtras = ['xyz', 'inscricao', 'processo', 'online', 'mail', 'login', 'seguranca', 'verify', 'cloud', 'digital', 'app', 'id'];
    const prefixosExtras = ['login', 'conta', 'portal', 'seguranca', 'auth', 'mail', 'inscricao', 'processo'];
    const adicionar = (valor: string) => { if (valor) palavras.add(valor.toLowerCase()); };
    partes.forEach(adicionar);
    gerarVariacoes(partes).forEach(adicionar);
    gerarVariacoes(partes).forEach(variacao => {
        sufixosExtras.forEach(sufixo => {
            adicionar(`${variacao}${sufixo}`);
            adicionar(`${variacao}-${sufixo}`);
            adicionar(`${variacao}.${sufixo}`);
        });
        prefixosExtras.forEach(prefixo => {
            adicionar(`${prefixo}${variacao}`);
            adicionar(`${prefixo}-${variacao}`);
            adicionar(`${prefixo}.${variacao}`);
        });
    });
    return Array.from(palavras).slice(0, 120);
};

export const gerarDadosPhishing = (endereco: string) => {
    const normalizado = sanitizar(endereco);
    const partes = normalizado.split('.').filter(Boolean);
    if (!partes.length) return { palavras: [] as string[], tlds: [] as string[] };

    const troncoBase = partes.length > 2 ? partes.slice(0, -2) : partes.slice(0, -1);
    const nucleos = troncoBase.length ? troncoBase : partes.slice(0, 1);
    const palavras = gerarPalavras(nucleos);
    if (!palavras.length && nucleos.length) palavras.push(nucleos[0]);

    const tldPrincipal = partes.slice(-2).join('.') || partes[partes.length - 1];
    const tldCurto = partes[partes.length - 1];
    const tlds = Array.from(new Set([tldPrincipal, tldCurto, "com", "net", "org", "io", "br"].filter(Boolean)));

    return { palavras, tlds };
};
