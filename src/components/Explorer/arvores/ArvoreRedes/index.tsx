"use client";
import { Button, Tree } from "antd";
import { useContext, useEffect, useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { StyledArvoreDominio, StyledTitleDominio, StyledTitleDominioIcon } from "../ArvoreDominios/styles";
import StoreContext from "@/store";
import useApi from "@/api";
import useElementoIp from "../../target/ElementoIp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNetworkWired } from "@fortawesome/free-solid-svg-icons";
import { NoCarregavel } from "../../target/tipos";
import { atualizarFilhos } from "../../target/atualizarArvore";

const ArvoreRedes = () => {
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const { data: ipsProjeto, refetch: recarregarIps } = api.ips.getIps(projeto?.get()?.id);
  const elementoIp = useElementoIp();
  const [elementos, setElementos] = useState<NoCarregavel[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      setCarregando(true);
      if (ipsProjeto && ativo) {
        const sorted = [...ipsProjeto].sort((a, b) => a.endereco.localeCompare(b.endereco, undefined, { numeric: true }));
        const elems: NoCarregavel[] = [];
        for (const ip of sorted) {
          elems.push(await elementoIp.getIp(ip));
        }
        if (ativo) setElementos(elems);
      } else if (ativo) {
        setElementos([]);
      }
      if (ativo) {
        setExpandedKeys([]);
        setCarregando(false);
      }
    };
    carregar();
    return () => {
      ativo = false;
    };
  }, [ipsProjeto]);

  const carregarNo = async (no: any) => {
    const alvo = no as NoCarregavel;
    if (alvo.children || !alvo.carregar) return;
    const filhos = await alvo.carregar();
    setElementos(atual => atualizarFilhos(atual, alvo.key, filhos));
  };

  const onExpand = (novasChaves: React.Key[]) => {
    setExpandedKeys(novasChaves);
  };

  const refresh = async () => {
    const abertas = expandedKeys;
    setCarregando(true);
    setExpandedKeys([]);
    const resposta = await recarregarIps();
    const lista = resposta.data || ipsProjeto;
    if (lista) {
      const sorted = [...lista].sort((a, b) => a.endereco.localeCompare(b.endereco, undefined, { numeric: true }));
      const resolvidos = await Promise.all(sorted.map(ip => elementoIp.getIp(ip)));
      setElementos(resolvidos);
      setExpandedKeys(abertas);
    } else {
      setElementos([]);
    }
    setCarregando(false);
  };

  return (
    <StyledArvoreDominio>
      <StyledTitleDominio>
         rede <FontAwesomeIcon icon={faNetworkWired} style={{marginLeft: 10, fontSize: 12}} />
         <StyledTitleDominioIcon>
          <Button icon={<ReloadOutlined />} onClick={refresh} loading={carregando} type="text" />
         </StyledTitleDominioIcon>
      </StyledTitleDominio>
      <Tree treeData={elementos} showIcon={true} showLine={true} loadData={carregarNo} expandedKeys={expandedKeys} onExpand={onExpand} />
    </StyledArvoreDominio>
  );
};

export default ArvoreRedes;
