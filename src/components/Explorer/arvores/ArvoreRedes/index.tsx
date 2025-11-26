"use client";
import { Tree, TreeDataNode } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { StyledArvoreDominio, StyledTitleDominio } from "../ArvoreDominios/styles";
import StoreContext from "@/store";
import useApi from "@/api";
import useElementoIp from "../../target/ElementoIp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNetworkWired } from "@fortawesome/free-solid-svg-icons";

const ArvoreRedes = () => {
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const idProjeto = useMemo(() => projeto?.get()?.id, [projeto]);
  const { data: ipsProjeto } = api.ips.useIpsProjeto(idProjeto);
  const elementoIp = useElementoIp();
  const [elementos, setElementos] = useState<TreeDataNode[]>([]);

  useEffect(() => {
    const carregar = async () => {
        const elementosOrdenados: TreeDataNode[] = [];
        if (ipsProjeto) {
            const ipsOrdenados = [...ipsProjeto].sort((a, b) => a.endereco.localeCompare(b.endereco, undefined, { numeric: true }));
            for (const ip of ipsOrdenados) {
                elementosOrdenados.push(await elementoIp.getIp(ip));
            }
        }
        setElementos(elementosOrdenados);
    };
    carregar();
  }, [ipsProjeto, elementoIp]);

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
