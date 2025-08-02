"use client"
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { useQuery } from "@tanstack/react-query";

const useProjetos = () => {

    const getProjetos = () => useQuery({
        queryKey: ["projetos"],
        queryFn: async (): Promise<ProjetoResponse[]> => {
            const res = await fetch("/api/v1/projetos");
            const data = await res.json();
            return data;
        },
    });
    
    const postProjeto = () => useQuery({
        queryKey: ["novoProjeto"],
        queryFn: async (): Promise<ProjetoResponse> => {
            const res = await fetch("/api/v1/projetos");
            const data = await res.json();
            return data;
        },
    });

    return { getProjetos, postProjeto };
}

export default useProjetos
