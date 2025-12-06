"use client"
import { Button, Tree } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { StyledArvoreDominio, StyledTitleDominio, StyledTitleDominioIcon } from '../ArvoreDominios/styles';
import useApi from '@/api';
import StoreContext from '@/store';
import useElementoDominio from '../../target/ElementoDominio';
import { NoCarregavel } from '../../target/tipos';
import { atualizarFilhos } from '../../target/atualizarArvore';

const ArvoreDns = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [chavesCarregadas, setChavesCarregadas] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const { data: dnsProjeto, refetch: recarregarDns } = api.dns.getDns(projeto?.get()?.id);
  const elementoDominio = useElementoDominio("dns");
  const [elementos, setElementos] = useState<NoCarregavel[]>([]);

  useEffect(() => {
    setElementos([]);
    setExpandedKeys([]);
    setChavesCarregadas([]);
  }, [projeto?.get()?.id]);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      setCarregando(true);
      if (dnsProjeto && ativo) {
        const resolvidos = await Promise.all(dnsProjeto.map(d => elementoDominio.getDominio(d)));
        if (ativo) setElementos(resolvidos);
      } else if (ativo) {
        setElementos([]);
      }
      if (ativo) {
        setExpandedKeys([]);
        setChavesCarregadas([]);
        setAutoExpandParent(false);
        setCarregando(false);
      }
    };
    carregar();
    return () => {
      ativo = false;
    };
  }, [dnsProjeto, elementoDominio]);

  const onExpand = (novasChaves: React.Key[]) => {
    setExpandedKeys(novasChaves);
    setAutoExpandParent(false);
  };

  const carregarNo = async (no: any) => {
    const alvo = no as NoCarregavel;
    if (alvo.children || !alvo.carregar) return;
    const filhos = await alvo.carregar();
    setElementos(atual => atualizarFilhos(atual, alvo.key, filhos));
    setChavesCarregadas(atual => [...new Set([...atual, alvo.key])]);
  };

  const sortedElementos = useMemo(() => {
    return [...elementos].sort((a, b) => a.key && b.key && a.key > b?.key ? 1 : -1)
  }, [elementos]);

  const refresh = async () => {
    const abertas = expandedKeys;
    setAutoExpandParent(false);
    setExpandedKeys([]);
    setChavesCarregadas([]);
    setCarregando(true);
    const resposta = await recarregarDns();
    const lista = resposta.data || dnsProjeto;
    if (lista) {
      const resolvidos = await Promise.all(lista.map(d => elementoDominio.getDominio(d)));
      setElementos(resolvidos);
      setExpandedKeys(abertas);
    } else {
      setElementos([]);
    }
    setCarregando(false);
  };

  return <StyledArvoreDominio>
    <StyledTitleDominio>
      dns
      <StyledTitleDominioIcon>
        <Button icon={<ReloadOutlined />} onClick={refresh} loading={carregando} type="text" />
      </StyledTitleDominioIcon>
    </StyledTitleDominio>
    <Tree
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      treeData={sortedElementos}
      showIcon={true}
      showLine={true}
      loadData={carregarNo}
      loadedKeys={chavesCarregadas}
      switcherIcon={<SendOutlined style={{ transform: "rotate(90deg)" }} />}
    />
  </StyledArvoreDominio>
}

export default ArvoreDns
