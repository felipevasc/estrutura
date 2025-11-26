"use client";
import { UsuarioResponse } from "@/types/UsuarioResponse";
import { useQuery } from "@tanstack/react-query";

const useUsuarios = () => {
    const useUsuariosProjeto = (idProjeto?: number) => useQuery({
        queryKey: ["usuarios", idProjeto],
        queryFn: async (): Promise<UsuarioResponse[]> => {
            const resposta = await fetch(`/api/v1/projetos/${idProjeto}/usuarios`);
            const dados = await resposta.json();
            return dados;
        },
        enabled: !!idProjeto,
    });

    return { useUsuariosProjeto };
};

export default useUsuarios;
