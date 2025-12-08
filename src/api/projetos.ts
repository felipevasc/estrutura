"use client"
import { ProjetoRequest } from "@/types/ProjetoRequest";
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useProjetosLista = () => useQuery({
    queryKey: ["projetos"],
    queryFn: async (): Promise<ProjetoResponse[]> => {
        const res = await fetch("/api/v1/projetos");
        const data = await res.json();
        return data;
    },
});

const usePostProjeto = () => useMutation({
    mutationKey: ["novoProjeto"],
    mutationFn: async (request: ProjetoRequest): Promise<ProjetoResponse> => {
        const res = await fetch('/api/v1/projetos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        const data = await res.json();
        return data;
    },
});

const usePutProjeto = () => useMutation({
    mutationKey: ["salvaProjeto"],
    mutationFn: async (request: ProjetoResponse): Promise<ProjetoResponse> => {
        const res = await fetch(`/api/v1/projetos/${request.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        const data = await res.json();
        return data;
    },
});

const useDeleteProjeto = () => useMutation({
    mutationKey: ["removeProjeto"],
    mutationFn: async (id: number): Promise<void> => {
        await fetch(`/api/v1/projetos/${id}`, {
            method: 'DELETE',
        });
    },
});


const useProjetos = () => useMemo(() => ({ getProjetos: useProjetosLista, postProjeto: usePostProjeto, putProjeto: usePutProjeto, deleteProjeto: useDeleteProjeto }), []);

export default useProjetos
