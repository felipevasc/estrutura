"use client";
import { Tree, TreeDataNode } from "antd";
import { useContext, useEffect, useState } from "react";
import { StyledArvoreDominio, StyledTitleDominio } from "../ArvoreDominios/styles";
import StoreContext from "@/store";
import useApi from "@/api";
import useElementoIp from "../../target/ElementoIp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNetworkWired } from "@fortawesome/free-solid-svg-icons";

const ArvoreRedes = () => {
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const { data: ipsProjeto } = api.ips.getIps(projeto?.get()?.id);
  const elementoIp = useElementoIp();
  const [elementos, setElementos] = useState<TreeDataNode[]>([]);

  useEffect(() => {
    const carregar = async () => {
        const elems: TreeDataNode[] = [];
        if (ipsProjeto) {
            // Sort by IP address logic could be complex (string vs numeric), simpler string sort for now
            const sorted = [...ipsProjeto].sort((a, b) => a.endereco.localeCompare(b.endereco, undefined, { numeric: true }));

            for (const ip of sorted) {
                // Pass skipChildrenTypes if needed, but for Network view we want everything (Dominios, Portas, etc)
                elems.push(await elementoIp.getIp(ip));
            }
        }
        setElementos(elems);
    };
    carregar();
  }, [ipsProjeto]);

  return (
    <StyledArvoreDominio>
      <StyledTitleDominio>
         rede <FontAwesomeIcon icon={faNetworkWired} style={{marginLeft: 10, fontSize: 12}} />
      </StyledTitleDominio>
      <Tree treeData={elementos} showIcon={true} showLine={true} />
    </StyledArvoreDominio>
  );
};

export default ArvoreRedes;
