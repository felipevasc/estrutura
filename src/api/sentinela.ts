import { useCallback, useMemo } from "react";
import { AtualizacaoSentinela, NovoSentinela, SentinelaRegistro } from "@/types/Sentinela";

const useSentinela = () => {
    const listar = useCallback(async (projetoId: number) => {
        const resposta = await fetch(`/api/v1/projetos/${projetoId}/sentinela`);
        const corpo = await resposta.json();
        return corpo.registros as SentinelaRegistro[];
    }, []);

    const criar = useCallback(async (projetoId: number, dados: NovoSentinela) => {
        const resposta = await fetch(`/api/v1/projetos/${projetoId}/sentinela`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });
        const corpo = await resposta.json();
        if (!resposta.ok) throw new Error(corpo.mensagem || 'Falha ao criar registro');
        return corpo.registro as SentinelaRegistro;
    }, []);

    const atualizar = useCallback(async (projetoId: number, id: number, dados: AtualizacaoSentinela) => {
        const resposta = await fetch(`/api/v1/projetos/${projetoId}/sentinela/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });
        const corpo = await resposta.json();
        if (!resposta.ok) throw new Error(corpo.mensagem || 'Falha ao atualizar registro');
        return corpo.registro as SentinelaRegistro;
    }, []);

    const remover = useCallback(async (projetoId: number, id: number) => {
        const resposta = await fetch(`/api/v1/projetos/${projetoId}/sentinela/${id}`, { method: 'DELETE' });
        if (!resposta.ok) {
            const corpo = await resposta.json();
            throw new Error(corpo.mensagem || 'Falha ao remover registro');
        }
    }, []);

    const executar = useCallback(async (projetoId: number, id: number) => {
        const resposta = await fetch(`/api/v1/projetos/${projetoId}/sentinela/${id}/executar`, { method: 'POST' });
        const corpo = await resposta.json();
        if (!resposta.ok) throw new Error(corpo.mensagem || 'Falha ao executar registro');
        return corpo.registro as SentinelaRegistro;
    }, []);

    return useMemo(() => ({ listar, criar, atualizar, remover, executar }), [listar, criar, atualizar, remover, executar]);
};

export default useSentinela;
