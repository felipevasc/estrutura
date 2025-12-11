"use client"
import { useCallback } from "react";

type TipoAlvo = "dominio" | "porta" | "diretorio";

type AlvoCaptura = { tipo: TipoAlvo; id: number };

type CorpoCaptura = { alvos?: AlvoCaptura[]; abrangencia?: "subdominios" | "diretorios" | "portas"; dominioId?: number | null; ipId?: number | null; diretorioId?: number | null };

const useRecon = () => {
    const capturar = useCallback(async (projetoId: number | undefined, corpo: CorpoCaptura) => {
        if (!projetoId) throw new Error("Projeto inválido");
        const resposta = await fetch(`/api/v1/projetos/${projetoId}/recon/capturas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo)
        });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados?.error || "Falha ao enfileirar capturas");
        return dados;
    }, []);

    return { capturar };
};

export type { AlvoCaptura, CorpoCaptura };
export default useRecon;
