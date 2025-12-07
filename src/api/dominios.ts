"use client"
import { DominioRequest } from "@/types/DominioRequest";
import { DominioResponse } from "@/types/DominioResponse";
import { IpResponse } from "@/types/IpResponse";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const montarQuery = (limiteFilhos?: number, limitarDiretos = true) => {
    const params = new URLSearchParams();
    if (limiteFilhos !== undefined) params.set("limiteFilhos", String(limiteFilhos));
    if (!limitarDiretos) params.set("limitarDiretos", "false");
    const texto = params.toString();
    return texto ? `?${texto}` : "";
};

const useDominios = () => {
    const reactQuery = useQueryClient();

    const getDominios = useCallback((idProjeto?: number, limiteFilhos?: number, limitarDiretos = true) => useQuery({
        queryKey: ["dominios", idProjeto, limiteFilhos, limitarDiretos],
        queryFn: async (): Promise<DominioResponse[]> => {
            const res = await fetch(`/api/v1/projetos/${idProjeto}/dominios${montarQuery(limiteFilhos, limitarDiretos)}`);
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

    const buscarDominio = useCallback(async (idDominio?: number, limitarDiretos = true, limiteFilhos?: number): Promise<DominioResponse | undefined> => {
        if (!idDominio) return;
        const res = await fetch(`/api/v1/dominios/${idDominio}${montarQuery(limiteFilhos, limitarDiretos)}`);
        const data = await res.json();
        return data;
    }, []);

    const getDominio = (idDominio?: number, limitarDiretos = true, limiteFilhos?: number) => useQuery({
        queryKey: ["get-dominio", idDominio, limitarDiretos, limiteFilhos],
        queryFn: async (): Promise<DominioResponse> => {
            const data = await buscarDominio(idDominio, limitarDiretos, limiteFilhos);
            return data as DominioResponse;
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

    return useMemo(() => ({ getDominios, postDominios, getDominio, getSubdominios, getIps, buscarDominio }), [getDominios, postDominios, getDominio, getSubdominios, getIps, buscarDominio]);
}

export default useDominios
