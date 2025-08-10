"use client"
import { ProjetoRequest } from "@/types/ProjetoRequest";
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { useMutation, useQuery } from "@tanstack/react-query";

const useProjetos = () => {

    const getProjetos = () => useQuery({
        queryKey: ["projetos"],
        queryFn: async (): Promise<ProjetoResponse[]> => {
            const res = await fetch("/api/v1/projetos");
            const data = await res.json();
            return data;
        },
    });
    
    const postProjeto = () => useMutation({
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

    const putProjeto = () => useMutation({
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

    const deleteProjeto = () => useMutation({
        mutationKey: ["removeProjeto"],
        mutationFn: async (id: number): Promise<void> => {
            await fetch(`/api/v1/projetos/${id}`, {
                method: 'DELETE',
            });
        },
    });

    const getUsuarios = (id: number) => useQuery({
        queryKey: ["projetos", id, "usuarios"],
        queryFn: async () => {
            const res = await fetch(`/api/v1/projetos/${id}/usuarios`);
            const data = await res.json();
            return data;
        },
    });


    return { getProjetos, postProjeto, putProjeto, deleteProjeto, getUsuarios };
}

export default useProjetos
