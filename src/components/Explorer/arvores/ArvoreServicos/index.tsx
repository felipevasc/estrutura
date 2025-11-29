"use client";
import { Button, Tree } from "antd";
import { useContext, useEffect, useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { StyledArvoreDominio, StyledTitleDominio, StyledTitleDominioIcon } from "../ArvoreDominios/styles";
import StoreContext from "@/store";
import useElementoServico from "../../target/ElementoServico";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";
import { PortaResponse } from "@/types/PortaResponse";
import { NoCarregavel } from "../../target/tipos";
import { atualizarFilhos } from "../../target/atualizarArvore";

const ArvoreServicos = () => {
  const { projeto } = useContext(StoreContext);

  const [elementos, setElementos] = useState<NoCarregavel[]>([]);
  const elementoServico = useElementoServico();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregarServicos = async () => {
    const projetoId = projeto?.get()?.id;
    if (!projetoId) {
      setElementos([]);
      setExpandedKeys([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    const res = await fetch(`/api/v1/projetos/${projetoId}/servicos`);
    const portas: PortaResponse[] = await res.json();

    const mapa = new Map<string, PortaResponse[]>();
    portas.forEach(p => {
      const nome = p.servico || "Desconhecido";
      if (!mapa.has(nome)) mapa.set(nome, []);
      mapa.get(nome)?.push(p);
    });

    const elems: NoCarregavel[] = [];
    for (const [nome, lista] of mapa) {
      elems.push(await elementoServico.getServico(nome, lista));
    }

    setElementos(elems);
    setExpandedKeys([]);
    setCarregando(false);
  };

  useEffect(() => {
    carregarServicos();
  }, [projeto?.get()?.id]);

  const carregarNo = async (no: any) => {
    const alvo = no as NoCarregavel;
    if (alvo.children || !alvo.carregar) return;
    const filhos = await alvo.carregar();
    setElementos(atual => atualizarFilhos(atual, alvo.key, filhos));
  };

  const onExpand = (novasChaves: React.Key[]) => {
    setExpandedKeys(novasChaves);
  };

  return (
    <StyledArvoreDominio>
      <StyledTitleDominio>
         serviços <FontAwesomeIcon icon={faCogs} style={{marginLeft: 10, fontSize: 12}} />
         <StyledTitleDominioIcon>
          <Button icon={<ReloadOutlined />} onClick={carregarServicos} loading={carregando} type="text" />
         </StyledTitleDominioIcon>
      </StyledTitleDominio>
      <Tree treeData={elementos} showIcon={true} showLine={true} loadData={carregarNo} expandedKeys={expandedKeys} onExpand={onExpand} />
    </StyledArvoreDominio>
  );
};

export default ArvoreServicos;
