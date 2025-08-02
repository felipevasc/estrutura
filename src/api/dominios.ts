"use client"
import { DominioRequest } from "@/types/DominioRequest";
import { DominioResponse } from "@/types/DominioResponse";
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { useQuery } from "@tanstack/react-query";

export const getDominios = () => useQuery({
    queryKey: ["dominios"],
    queryFn: async (): Promise<DominioResponse[]> => {
        const res = await fetch("/api/v1/dominios");
        const data = await res.json();
        return data;
    },
});

export const postDominios = async (d: DominioRequest): Promise<DominioResponse> => {
    const res = await fetch("/api/v1/dominios", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(d),
    });
    const data = await res.json();
    return data;
};