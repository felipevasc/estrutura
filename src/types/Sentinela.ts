import { SentinelaModulo } from "@prisma/client";

export type SentinelaRegistro = {
    id: number;
    nome: string;
    modulo: SentinelaModulo;
    ferramenta: string;
    parametros: Record<string, unknown>;
    cron: string;
    habilitado: boolean;
    proximaExecucao: string | null;
    ultimaExecucao: string | null;
    projetoId: number;
    criadoEm: string;
    atualizadoEm: string;
};

export type NovoSentinela = {
    nome: string;
    modulo: SentinelaModulo;
    ferramenta: string;
    parametros: Record<string, unknown>;
    cron: string;
    habilitado: boolean;
};

export type AtualizacaoSentinela = Partial<NovoSentinela>;
