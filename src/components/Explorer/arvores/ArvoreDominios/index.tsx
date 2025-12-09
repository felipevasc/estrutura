"use client"
import { Button, Tree } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { StyledArvoreDominio, StyledTitleDominio, StyledTitleDominioIcon } from './styles';
import NovoDominio from './NovoDominio';
import useApi from '@/api';
import StoreContext from '@/store';
import useElementoDominio from '../../target/ElementoDominio';
import { NoCarregavel } from '../../target/tipos';
import { atualizarFilhos } from '../../target/atualizarArvore';
import useLimiteArvore from '../../target/useLimiteArvore';

const ArvoreDominios = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [chavesCarregadas, setChavesCarregadas] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const { data: dominiosProjeto, refetch: recarregarDominios } = api.dominios.getDominios(projeto?.get()?.id);
  const { limitar, resetar } = useLimiteArvore();
  const elementoDominio = useElementoDominio("domain", limitar);
  const [elementos, setElementos] = useState<NoCarregavel[]>([]);

  useEffect(() => {
    setElementos([]);
    setExpandedKeys([]);
    setChavesCarregadas([]);
    resetar();
  }, [projeto?.get()?.id, resetar]);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      setCarregando(true);
      if (dominiosProjeto && ativo) {
        const resolvidos = await Promise.all(dominiosProjeto.map(d => elementoDominio.getDominio(d)));
        if (ativo) setElementos(resolvidos);
      } else if (ativo) {
        setElementos([]);
      }
      if (ativo) {
        setExpandedKeys([]);
        setChavesCarregadas([]);
        setAutoExpandParent(false);
        resetar();
        setCarregando(false);
      }
    };
    carregar();
    return () => {
      ativo = false;
    };
  }, [dominiosProjeto, resetar, elementoDominio]);

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

  const elementosLimitados = useMemo(() => limitar("dominios", sortedElementos), [limitar, sortedElementos]);

  const refresh = async () => {
    const abertas = expandedKeys;
    setAutoExpandParent(false);
    setExpandedKeys([]);
    setChavesCarregadas([]);
    resetar();
    setCarregando(true);
    const resposta = await recarregarDominios();
    const lista = resposta.data || dominiosProjeto;
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
      dominio
      <StyledTitleDominioIcon>
        <Button icon={<ReloadOutlined />} onClick={refresh} loading={carregando} type="text" />
        <NovoDominio />
      </StyledTitleDominioIcon>
    </StyledTitleDominio>
    <Tree
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      treeData={elementosLimitados}
      showIcon={true}
      showLine={true}
      loadData={carregarNo}
      loadedKeys={chavesCarregadas}
      switcherIcon={<SendOutlined style={{ transform: "rotate(90deg)" }} />}
    />
  </StyledArvoreDominio>
}

export default ArvoreDominios
