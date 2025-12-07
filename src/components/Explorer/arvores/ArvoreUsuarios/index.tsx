"use client";
import { Button, Tree } from "antd";
import { useContext, useEffect, useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { StyledArvoreUsuario, StyledTitleUsuario } from "./styles";
import StoreContext from "@/store";
import useApi from "@/api";
import useElementoUsuario from "../../target/ElementoUsuario";
import useElementoIp from "../../target/ElementoIp";
import { NoCarregavel } from "../../target/tipos";
import { atualizarFilhos } from "../../target/atualizarArvore";

const ArvoreUsuarios = () => {
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const { data: usuariosProjeto, refetch: recarregarUsuarios } = api.usuarios.getUsuariosProjeto(projeto?.get()?.id);
  const [elementos, setElementos] = useState<NoCarregavel[]>([]);
  const elementoIp = useElementoIp();
  const elementoUsuario = useElementoUsuario({ obterIp: elementoIp.getIp });
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [chavesCarregadas, setChavesCarregadas] = useState<React.Key[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      setCarregando(true);
      const elems: NoCarregavel[] = [];
      if (usuariosProjeto) {
        for (const u of usuariosProjeto) {
          elems.push(await elementoUsuario.getUsuario(u));
        }
      }
      if (ativo) {
        setElementos(elems);
        setExpandedKeys([]);
        setChavesCarregadas([]);
        setCarregando(false);
      }
    };
    carregar();
    return () => {
      ativo = false;
    };
  }, [usuariosProjeto]);

  const carregarNo = async (no: any) => {
    const alvo = no as NoCarregavel;
    if (alvo.children || !alvo.carregar) return;
    const filhos = await alvo.carregar();
    setElementos(atual => atualizarFilhos(atual, alvo.key, filhos));
    setChavesCarregadas(atual => [...new Set([...atual, alvo.key])]);
  };

  const onExpand = (novasChaves: React.Key[]) => {
    setExpandedKeys(novasChaves);
  };

  const refresh = async () => {
    const abertas = expandedKeys;
    setCarregando(true);
    setExpandedKeys([]);
    setChavesCarregadas([]);
    const resposta = await recarregarUsuarios();
    const lista = resposta.data || usuariosProjeto;
    if (lista) {
      const resolvidos = await Promise.all(lista.map(u => elementoUsuario.getUsuario(u)));
      setElementos(resolvidos);
      setExpandedKeys(abertas);
    } else {
      setElementos([]);
    }
    setCarregando(false);
  };

  return (
    <StyledArvoreUsuario>
      <StyledTitleUsuario>
        usuário
        <Button icon={<ReloadOutlined />} onClick={refresh} loading={carregando} type="text" style={{ marginLeft: "auto" }} />
      </StyledTitleUsuario>
      <Tree treeData={elementos} showIcon={true} showLine={true} loadData={carregarNo} expandedKeys={expandedKeys} onExpand={onExpand} loadedKeys={chavesCarregadas} />
    </StyledArvoreUsuario>
  );
};

export default ArvoreUsuarios;
