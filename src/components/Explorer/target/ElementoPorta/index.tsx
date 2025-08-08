import useApi from "@/api";
import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse"
import { IpResponse } from "@/types/IpResponse";
import { PortaResponse } from "@/types/PortaResponse";
import { GlobalOutlined,  } from "@ant-design/icons";
import { faCircleNotch, faHouseLaptop, faLaptop, faLaptopCode, faNetworkWired, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";

const useElementoPorta = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const api = useApi();

  const selecionado = selecaoTarget?.get()

  const getPorta = async (porta: PortaResponse): Promise<TreeDataNode> => {
    const checked = selecionado?.tipo === "porta" && selecionado?.id === porta.id;
    
    const filhos: TreeDataNode[] = [];
    
    return {
      key: `${porta.numero}-${porta.id}}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "porta", id: porta.id })
      }}>
        <FontAwesomeIcon icon={faCircleNotch}  />{' '}
        {porta.numero}{porta.protocolo ? '/' + porta.protocolo : ''}
      </div>,
      className: "porta " + (checked ? "checked " : ""),
      children: filhos
    }
  }

  return {
    getPorta
  }
}

export default useElementoPorta