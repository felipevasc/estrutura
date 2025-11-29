"use client"
import { DominioRequest } from "@/types/DominioRequest";
import { DominioResponse } from "@/types/DominioResponse";
import { IpResponse } from "@/types/IpResponse";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const useDominios = () => {
    const clienteReactQuery = useQueryClient();

    const useDominiosProjeto = (idProjeto?: number) => useQuery({
        queryKey: ["dominios", idProjeto],
        queryFn: async (): Promise<DominioResponse[]> => {
            const resposta = await fetch("/api/v1/projetos/" + idProjeto + "/dominios");
            const dados = await resposta.json();
            return dados;
        },
        enabled: !!idProjeto
    });

    const criarDominio = useCallback(async (dadosDominio: DominioRequest): Promise<DominioResponse> => {
        const resposta = await fetch("/api/v1/dominios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosDominio),
        });
        const dados = await resposta.json();
        clienteReactQuery.invalidateQueries({ queryKey: ["dominios", dadosDominio.projetoId] });
        return dados;
    }, [clienteReactQuery]);

    const useDominio = (idDominio?: number) => useQuery({
        queryKey: ["get-dominio", idDominio],
        queryFn: async (): Promise<DominioResponse> => {
            const resposta = await fetch("/api/v1/dominios/" + idDominio);
            const dados = await resposta.json();
            return dados;
        },
        enabled: !!idDominio
    });

    const buscarSubdominios = useCallback(async (idDominio?: number): Promise<DominioResponse[]> => {
        const resposta = await fetch("/api/v1/dominios/" + idDominio + "/subdominios");
        const dados = await resposta.json();
        return dados;
    }, []);

    const buscarIps = useCallback(async (idDominio?: number): Promise<IpResponse[]> => {
        const resposta = await fetch("/api/v1/dominios/" + idDominio + "/ips");
        const dados = await resposta.json();
        return dados;
    }, []);

    return { useDominiosProjeto, criarDominio, useDominio, buscarSubdominios, buscarIps };
}

export default useDominios
