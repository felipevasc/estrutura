"use client"
import { Tree, TreeDataNode } from 'antd';
import { useContext, useMemo, useState } from 'react';
import { GlobalOutlined, SendOutlined } from '@ant-design/icons';
import { StyledArvoreDominio, StyledTitleDominio, StyledTitleDominioIcon } from './styles';
import NovoDominio from './NovoDominio';
import useApi from '@/api';
import StoreContext from '@/store';
import useElementoDominio from '../../target/ElementoDominio';

const ArvoreDominios = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const api = useApi();
  const { projeto, selecaoTarget } = useContext(StoreContext);
  const { data: dominiosProjeto } = api.dominios.getDominios(projeto?.get()?.id);
  const elementoDominio = useElementoDominio();
  
  const selecionado = selecaoTarget?.get()
  
  const elementos: TreeDataNode[] | undefined = useMemo(() => {
    return dominiosProjeto?.map((d) => {

      let checked = false;
      if (selecionado?.tipo === "domain" && selecionado?.id === d.id) {
        checked = true;
      }
      return (elementoDominio.getDominio(d))
    }
    )
  }, [dominiosProjeto, selecionado])

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

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
      treeData={elementos}
      showIcon={true}
      showLine={true}
      switcherIcon={<SendOutlined style={{ transform: "rotate(90deg)" }} />}

    />
  </StyledArvoreDominio>
}

export default ArvoreDominios