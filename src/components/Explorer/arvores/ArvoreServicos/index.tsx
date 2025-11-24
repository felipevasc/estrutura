"use client";
import { Tree, TreeDataNode } from "antd";
import { useContext, useEffect, useState } from "react";
import { StyledArvoreDominio, StyledTitleDominio } from "../ArvoreDominios/styles";
import StoreContext from "@/store";
import useApi from "@/api";
import useElementoServico from "../../target/ElementoServico";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";
import { PortaResponse } from "@/types/PortaResponse";

const ArvoreServicos = () => {
  const api = useApi();
  const { projeto } = useContext(StoreContext);

  const [elementos, setElementos] = useState<TreeDataNode[]>([]);
  const elementoServico = useElementoServico();

  useEffect(() => {
    const load = async () => {
        const projetoId = projeto?.get()?.id;
        if (!projetoId) return;

        try {
            const res = await fetch(`/api/v1/projetos/${projetoId}/servicos`);
            const portas: PortaResponse[] = await res.json();

            // Group by service name
            const map = new Map<string, PortaResponse[]>();
            portas.forEach(p => {
                const name = p.servico || "Desconhecido";
                if (!map.has(name)) map.set(name, []);
                map.get(name)?.push(p);
            });

            const elems: TreeDataNode[] = [];
            for (const [name, list] of map) {
                elems.push(await elementoServico.getServico(name, list));
            }

            setElementos(elems);
        } catch (e) {
            console.error("Erro ao carregar serviços", e);
        }
    }
    load();
  }, [projeto?.get()?.id]); // Safely depend on ID

  return (
    <StyledArvoreDominio>
      <StyledTitleDominio>
         serviços <FontAwesomeIcon icon={faCogs} style={{marginLeft: 10, fontSize: 12}} />
      </StyledTitleDominio>
      <Tree treeData={elementos} showIcon={true} showLine={true} />
    </StyledArvoreDominio>
  );
};

export default ArvoreServicos;
