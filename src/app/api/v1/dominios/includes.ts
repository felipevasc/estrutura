import { TipoDominio } from "@prisma/client";

const definirTake = (limitar: boolean, limite: number) => limitar && limite > 0 ? { take: limite } : {};

const montarIncludeIp = (limiteFilhos: number, limitarDiretos: boolean) => ({
    portas: { include: { whatwebResultados: true }, ...definirTake(limitarDiretos, limiteFilhos) },
    dominios: true,
    redes: true,
    usuarios: limitarDiretos && limiteFilhos > 0 ? { take: limiteFilhos } : true,
    diretorios: { include: { whatwebResultados: true }, ...definirTake(limitarDiretos, limiteFilhos) },
    whatwebResultados: true,
});

const montarIncludeDominio = (limiteFilhos: number, limitarDiretos: boolean, profundidade = 4, tipo = TipoDominio.principal): any => {
    const include = {
        whatwebResultados: true,
        ips: { include: montarIncludeIp(limiteFilhos, true), ...definirTake(limitarDiretos, limiteFilhos) },
        diretorios: { include: { whatwebResultados: true }, ...definirTake(limitarDiretos, limiteFilhos) },
    };

    if (profundidade <= 0) return include;

    return {
        ...include,
        subDominios: {
            where: { tipo },
            include: montarIncludeDominio(limiteFilhos, true, profundidade - 1, tipo),
            ...definirTake(limitarDiretos, limiteFilhos),
        },
    };
};

export { montarIncludeDominio };
