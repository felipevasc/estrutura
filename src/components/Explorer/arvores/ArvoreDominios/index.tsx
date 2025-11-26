"use client"
import { Tree, TreeDataNode } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { SendOutlined } from '@ant-design/icons';
import { StyledArvoreDominio, StyledTitleDominio, StyledTitleDominioIcon } from './styles';
import NovoDominio from './NovoDominio';
import useApi from '@/api';
import StoreContext from '@/store';
import useElementoDominio from '../../target/ElementoDominio';

const ArvoreDominios = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const idProjeto = useMemo(() => projeto?.get()?.id, [projeto]);
  const { data: dominiosProjeto } = api.dominios.useDominiosProjeto(idProjeto);
  const elementoDominio = useElementoDominio();
  const [elementos, setElementos] = useState<TreeDataNode[]>([]);

  useEffect(() => {
    setElementos([]);
    setExpandedKeys([]);
  }, [idProjeto])

  useEffect(() => {
    let ativo = true;

    if (dominiosProjeto) {
      const buscarDominios = async () => {
        const promessas = dominiosProjeto.map((dominio) => elementoDominio.getDominio(dominio));
        const elementosResolvidos = await Promise.all(promessas);
        if (ativo) {
          setElementos(elementosResolvidos);
        }
      };
      buscarDominios();
    } else {
      setElementos([]);
    }

    return () => {
      ativo = false;
    };
  }, [dominiosProjeto, elementoDominio]);

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const sortedElementos = useMemo(() => {
    return [...elementos].sort((a, b) => a.key && b.key && a.key > b?.key ? 1 : -1)
  }, [elementos])

  return <StyledArvoreDominio>
    <StyledTitleDominio>
      dominio
      <StyledTitleDominioIcon>
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
      switcherIcon={<SendOutlined style={{ transform: "rotate(90deg)" }} />}

    />
  </StyledArvoreDominio>
}

export default ArvoreDominios
