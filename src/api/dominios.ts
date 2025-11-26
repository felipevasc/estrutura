"use client"
import { DominioRequest } from "@/types/DominioRequest";
import { DominioResponse } from "@/types/DominioResponse";
import { IpResponse } from "@/types/IpResponse";
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const useDominios = () => {
    const reactQuery = useQueryClient();

    const getDominios = useCallback((idProjeto?: number) => useQuery({
        queryKey: ["dominios", idProjeto],
        queryFn: async (): Promise<DominioResponse[]> => {
            const res = await fetch("/api/v1/projetos/" + idProjeto + "/dominios");
            const data = await res.json();
            return data;
        },
        enabled: !!idProjeto
    }), []);

    const postDominios = useCallback(async (d: DominioRequest): Promise<DominioResponse> => {

        const res = await fetch("/api/v1/dominios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(d),
        });
        const data = await res.json();
        reactQuery.invalidateQueries({ queryKey: ["dominios", d.projetoId] });
        return data;
    }, [reactQuery]);

    const getDominio = (idDominio?: number) => useQuery({
        queryKey: ["get-dominio", idDominio],
        queryFn: async (): Promise<DominioResponse> => {
            const res = await fetch("/api/v1/dominios/" + idDominio);
            const data = await res.json();
            return data;
        },
        enabled: !!idDominio
    });

    const getSubdominios = useCallback(async (idDominio?: number): Promise<DominioResponse[]> => {
        const res = await fetch("/api/v1/dominios/" + idDominio + "/subdominios");
        const data = await res.json();
        return data;
    }, []);

    const getIps = useCallback(async (idDominio?: number): Promise<IpResponse[]> => {
        const res = await fetch("/api/v1/dominios/" + idDominio + "/ips");
        const data = await res.json();
        return data;
    }, []);

    return useMemo(() => ({ getDominios, postDominios, getDominio, getSubdominios, getIps }), [getDominios, postDominios, getDominio, getSubdominios, getIps]);
}

export default useDominios