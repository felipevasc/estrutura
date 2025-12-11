export const normalizarParametros = (entrada: unknown) => {
    if (typeof entrada === 'string') {
        try {
            return entrada ? JSON.parse(entrada) : {};
        } catch {
            return {};
        }
    }
    if (entrada && typeof entrada === 'object') return entrada as Record<string, unknown>;
    return {};
};
