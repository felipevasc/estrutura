"use client"
import { Button, Tree } from 'antd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { StyledArvoreDominio, StyledTitleDominio, StyledTitleDominioIcon } from './styles';
import NovoDominio from './NovoDominio';
import useApi from '@/api';
import StoreContext from '@/store';
import useElementoDominio from '../../target/ElementoDominio';
import { NoCarregavel } from '../../target/tipos';
import { atualizarFilhos } from '../../target/atualizarArvore';
import { DominioResponse } from '@/types/DominioResponse';

const ArvoreDominios = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [chavesCarregadas, setChavesCarregadas] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const { data: dominiosProjeto, refetch: recarregarDominios } = api.dominios.getDominios(projeto?.get()?.id);
  const elementoDominio = useElementoDominio();
  const [elementos, setElementos] = useState<NoCarregavel[]>([]);

  const montarElementos = useCallback(async (lista: DominioResponse[]) => {
    const grupos = new Map<string, DominioResponse[]>();
    lista.forEach(d => {
      const chave = d.tipo ?? 'subdominio';
      const atual = grupos.get(chave) ?? [];
      grupos.set(chave, [...atual, d]);
    });

    const ordem = ['principal', 'dns', 'alias'];
    const rotulos: Record<string, string> = { principal: 'Domínios', dns: 'DNS', alias: 'Alias', subdominio: 'Subdomínios' };

    const chaves = [...grupos.keys()].sort((a, b) => {
      const ia = ordem.indexOf(a);
      const ib = ordem.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    const nos: NoCarregavel[] = [];
    for (const chave of chaves) {
      const filhos = await Promise.all((grupos.get(chave) ?? []).map(d => elementoDominio.getDominio(d, [chave])));
      nos.push({
        key: `grupo-${chave}`,
        title: rotulos[chave] ?? 'Domínios',
        children: filhos,
        className: 'folder',
        isLeaf: filhos.length === 0
      });
    }
    return nos;
  }, [elementoDominio]);

  useEffect(() => {
    setElementos([]);
    setExpandedKeys([]);
    setChavesCarregadas([]);
  }, [projeto?.get()?.id]);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      setCarregando(true);
      if (dominiosProjeto && ativo) {
        const grupos = await montarElementos(dominiosProjeto);
        if (ativo) setElementos(grupos);
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
  }, [dominiosProjeto, montarElementos]);

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
    const ordem = ['grupo-principal', 'grupo-dns', 'grupo-alias'];
    return [...elementos].sort((a, b) => {
      const ia = ordem.indexOf(String(a.key));
      const ib = ordem.indexOf(String(b.key));
      if (ia === -1 && ib === -1) return String(a.key).localeCompare(String(b.key));
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [elementos]);

  const refresh = async () => {
    const abertas = expandedKeys;
    setAutoExpandParent(false);
    setExpandedKeys([]);
    setChavesCarregadas([]);
    setCarregando(true);
    const resposta = await recarregarDominios();
    const lista = resposta.data || dominiosProjeto;
    if (lista) {
      const grupos = await montarElementos(lista);
      setElementos(grupos);
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
      treeData={sortedElementos}
      showIcon={true}
      showLine={true}
      loadData={carregarNo}
      loadedKeys={chavesCarregadas}
      switcherIcon={<SendOutlined style={{ transform: "rotate(90deg)" }} />}
    />
  </StyledArvoreDominio>
}

export default ArvoreDominios
