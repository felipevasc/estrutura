const sanitizar = (texto: string) => texto.toLowerCase().replace(/https?:\/\//g, "").replace(/[^a-z0-9.-]/g, "").replace(/\.{2,}/g, ".").replace(/^-+|-+$/g, "").trim();

const gerarVariacoes = (partes: string[]) => {
    if (partes.length === 0) return [] as string[];
    const combinacoes = new Set<string>();
    const bases = [partes, partes.length > 1 ? [...partes].reverse() : partes];
    bases.forEach(lista => {
        combinacoes.add(lista.join('.'));
        combinacoes.add(lista.join(''));
        combinacoes.add(lista.join('-'));
    });
    return Array.from(combinacoes).filter(Boolean);
};

export const gerarTermosPhishing = (endereco: string) => {
    const normalizado = sanitizar(endereco);
    const partes = normalizado.split('.').filter(Boolean);
    if (!partes.length) return [] as string[];

    const tldPartes = partes.slice(-2);
    const tldPrincipal = tldPartes.join('.') || partes[partes.length - 1];
    const tldCurto = partes[partes.length - 1];
    const troncoBase = partes.length > 2 ? partes.slice(0, -2) : partes.slice(0, -1);
    const nucleos = troncoBase.length ? troncoBase : partes.slice(0, 1);
    const troncoComTld = [...nucleos, tldPartes[0]].filter(Boolean);

    const sufixosExtras = [
        'xyz', 'online', 'store', 'shop', 'mail', 'login', 'secure', 'verify', 'cloud', 'digital', 'app', 'id'
    ];
    const prefixosExtras = ['login', 'conta', 'portal', 'secure', 'auth', 'mail', 'pay'];

    const termos = new Set<string>();
    const adicionar = (valor: string) => { if (valor) termos.add(valor); };

    const variacoesBase = gerarVariacoes(nucleos);
    const variacoesComPrimeiroTld = gerarVariacoes(troncoComTld);

    const adicionarComTlds = (base: string) => {
        adicionar(`${base}.${tldPrincipal}`);
        adicionar(`${base}.${tldCurto}`);
    };

    [normalizado, partes.join('.')].forEach(adicionar);

    variacoesBase.forEach(variacao => {
        adicionarComTlds(variacao);
        sufixosExtras.forEach(sufixo => {
            adicionar(`${variacao}.${sufixo}`);
            adicionar(`${variacao}.${tldCurto}.${sufixo}`);
            adicionar(`${variacao}.${tldPrincipal}.${sufixo}`);
        });
    });

    variacoesComPrimeiroTld.forEach(variacao => {
        adicionar(`${variacao}.${tldCurto}`);
        sufixosExtras.forEach(sufixo => adicionar(`${variacao}.${sufixo}`));
    });

    variacoesBase.forEach(variacao => {
        prefixosExtras.forEach(prefixo => {
            adicionar(`${prefixo}.${variacao}.${tldPrincipal}`);
            adicionar(`${prefixo}-${variacao}.${tldPrincipal}`);
        });
    });

    if (nucleos.length > 1) {
        const parcial = nucleos.slice(0, nucleos.length - 1).join('.');
        adicionar(`${parcial}.${tldPrincipal}`);
        adicionar(`${parcial}.${tldCurto}`);
    }

    const termosOrdenados = [normalizado, ...Array.from(termos).filter(valor => valor !== normalizado)];
    return termosOrdenados.slice(0, 120);
};
