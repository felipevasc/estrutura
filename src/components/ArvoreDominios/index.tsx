"use client"
import { faBaby } from '@fortawesome/free-solid-svg-icons';
import { Input, Tree, TreeDataNode } from 'antd';
import { useContext, useMemo, useState } from 'react';
import { ClusterOutlined, GlobalOutlined, AlertFilled, SendOutlined, DownOutlined, DownCircleFilled, DownSquareTwoTone, PicLeftOutlined, PictureTwoTone } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StyledTitleDominio, StyledTitleDominioIcon } from './styles';
import { Button } from '@/common/components';
import NovoDominio from './NovoDominio';
import useApi from '@/api';
import StoreContext from '@/store';
import { icon } from '@fortawesome/fontawesome-svg-core';

const defaultData: TreeDataNode[] = [{
  key: "0",
  icon: <GlobalOutlined />,
  title: <><GlobalOutlined /> ASD1</>,
  children: [
    {
      key: "0-1",
      icon: <AlertFilled />,
      title: <><FontAwesomeIcon icon={faBaby} />ASD2</>
    },
    {
      key: "0-2",
      icon: <GlobalOutlined />,
      title: "ASD3"
    },
  ]
}];

const ArvoreDominios = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const api = useApi();
  const { projeto } = useContext(StoreContext);
  const { data: dominiosProjeto } = api.dominios.getDominios(projeto?.get()?.id);


  const elementos: TreeDataNode[] | undefined = useMemo(() => {
    return dominiosProjeto?.map(d => ({
      key: d.id ?? "",
      title: <div style={{ color: "#004" }}><GlobalOutlined /> {d.endereco}</div>
    }))
  }, [dominiosProjeto])

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const treeData = useMemo(() => {
    const loop = (data: TreeDataNode[]): TreeDataNode[] =>
      data.map((item) => {
        let title;
        if (typeof item.title === "string") {

          const strTitle = item.title as string;
          const index = strTitle.indexOf(searchValue);
          const beforeStr = strTitle.substring(0, index);
          const afterStr = strTitle.slice(index + searchValue.length);
          title =
            index > -1 ? (
              <span key={item.key}>
                {beforeStr}
                <span className="site-tree-search-value">{searchValue}</span>
                {afterStr}
              </span>
            ) : (
              <span key={item.key}>{strTitle}</span>
            );
        } else {
          title = item.title
        }
        if (item.children) {
          return { title, key: item.key, children: loop(item.children) };
        }

        return {
          title,
          key: item.key,
        };
      });

    return loop(defaultData);
  }, [searchValue]);

  return <div>
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
  </div>
}

export default ArvoreDominios