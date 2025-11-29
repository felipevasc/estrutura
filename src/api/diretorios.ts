"use client"
import { useQuery } from "@tanstack/react-query";
import { DiretorioResponse } from "@/types/DiretorioResponse";

const useDiretorio = (id?: number) => useQuery({
    queryKey: ["diretorio", id],
    queryFn: async (): Promise<DiretorioResponse> => {
        const res = await fetch("/api/v1/diretorios/" + id);
        const data = await res.json();
        return data;
    },
    enabled: !!id
});

const useDiretorios = () => ({ useDiretorio });

export default useDiretorios;
