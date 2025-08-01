"use client"
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { useQuery } from "@tanstack/react-query";

export const getProjetos = () => useQuery({
    queryKey: ["projetos"],
    queryFn: async (): Promise<ProjetoResponse[]> => {
        const res = await fetch("/api/v1/projetos");
        const data = await res.json();
        return data;
    },
});

export const postProjeto = () => useQuery({
    queryKey: ["projeto"],
    queryFn: async (): Promise<ProjetoResponse> => {
        const res = await fetch("/api/v1/projetos");
        const data = await res.json();
        return data;
    },
});