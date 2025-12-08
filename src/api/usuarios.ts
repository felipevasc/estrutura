"use client";
import { UsuarioResponse } from "@/types/UsuarioResponse";
import { useQuery } from "@tanstack/react-query";

const useUsuariosProjeto = (idProjeto?: number) => useQuery({
    queryKey: ["usuarios", idProjeto],
    queryFn: async (): Promise<UsuarioResponse[]> => {
        const res = await fetch(`/api/v1/projetos/${idProjeto}/usuarios`);
        const data = await res.json();
        return data;
    },
    enabled: !!idProjeto,
});

const useUsuarios = () => ({ getUsuariosProjeto: useUsuariosProjeto });

export default useUsuarios;
