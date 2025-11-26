"use client"
import { ProjetoRequest } from "@/types/ProjetoRequest";
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { useMutation, useQuery } from "@tanstack/react-query";

const useProjetos = () => {
    const useProjetosLista = () => useQuery({
        queryKey: ["projetos"],
        queryFn: async (): Promise<ProjetoResponse[]> => {
            const resposta = await fetch("/api/v1/projetos");
            const dados = await resposta.json();
            return dados;
        },
    });

    const useCriacaoProjeto = () => useMutation({
        mutationKey: ["novoProjeto"],
        mutationFn: async (pedido: ProjetoRequest): Promise<ProjetoResponse> => {
            const resposta = await fetch('/api/v1/projetos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedido),
            });
            const dados = await resposta.json();
            return dados;
        },
    });

    const useEdicaoProjeto = () => useMutation({
        mutationKey: ["salvaProjeto"],
        mutationFn: async (pedido: ProjetoResponse): Promise<ProjetoResponse> => {
            const resposta = await fetch(`/api/v1/projetos/${pedido.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedido),
            });
            const dados = await resposta.json();
            return dados;
        },
    });

    const useRemocaoProjeto = () => useMutation({
        mutationKey: ["removeProjeto"],
        mutationFn: async (id: number): Promise<void> => {
            await fetch(`/api/v1/projetos/${id}`, {
                method: 'DELETE',
            });
        },
    });

    return { useProjetosLista, useCriacaoProjeto, useEdicaoProjeto, useRemocaoProjeto };
}

export default useProjetos
