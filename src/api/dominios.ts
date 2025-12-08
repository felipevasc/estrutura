"use client"
import { DominioRequest } from "@/types/DominioRequest";
import { DominioResponse } from "@/types/DominioResponse";
import { IpResponse } from "@/types/IpResponse";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const useDominiosProjeto = (idProjeto?: number) => useQuery({
    queryKey: ["dominios", idProjeto],
    queryFn: async (): Promise<DominioResponse[]> => {
        const res = await fetch(`/api/v1/projetos/${idProjeto}/dominios?limite=1&limiteFilhos=1`);
        const data = await res.json();
        return data;
    },
    enabled: !!idProjeto
});

const useDominio = (idDominio?: number) => useQuery({
    queryKey: ["get-dominio", idDominio],
    queryFn: async (): Promise<DominioResponse> => {
        const res = await fetch("/api/v1/dominios/" + idDominio);
        const data = await res.json();
        return data;
    },
    enabled: !!idDominio
});

const useDominios = () => {
    const reactQuery = useQueryClient();

    const postDominios = useCallback(async (dominio: DominioRequest): Promise<DominioResponse> => {
        const res = await fetch("/api/v1/dominios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dominio),
        });
        const data = await res.json();
        reactQuery.invalidateQueries({ queryKey: ["dominios", dominio.projetoId] });
        return data;
    }, [reactQuery]);

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

    return useMemo(() => ({ getDominios: useDominiosProjeto, postDominios, getDominio: useDominio, getSubdominios, getIps }), [postDominios, getSubdominios, getIps]);
};

export default useDominios;