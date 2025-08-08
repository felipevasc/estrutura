import useApi from "@/api";
import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse"
import { IpResponse } from "@/types/IpResponse";
import { GlobalOutlined,  } from "@ant-design/icons";
import { faHouseLaptop, faLaptop, faLaptopCode, faNetworkWired, faServer, faPlug } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";

const useElementoIp = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const api = useApi();

  const selecionado = selecaoTarget?.get()

  const getIp = async (ip: IpResponse): Promise<TreeDataNode> => {
    const checked = selecionado?.tipo === "ip" && selecionado?.id === ip.id;
    
    const filhos: TreeDataNode[] = [];

    const portas = ip.portas ?? [];
    if (portas.length) {
      const filhosPortas: TreeDataNode[] = [];
      for (let i = 0; i < portas.length; i++) {
        const porta = portas[i];
        filhosPortas.push({
          key: `${ip.endereco}-${ip.id}-porta-${porta.id}`,
          title: <div onClick={() => {
            selecaoTarget?.set({ tipo: "port", id: porta.id })
          }}><FontAwesomeIcon icon={faPlug} />{' '}{porta.numero}/{porta.protocolo}</div>,
          className: "porta"
        });
      }
      filhos.push({
        key: `${ip.endereco}-${ip.id}-portas`,
        title: <div><FontAwesomeIcon icon={faPlug} />{' '}Portas</div>,
        children: filhosPortas,
        className: "folder"
      });
    }
    
    return {
      key: `${ip.endereco}-${ip.id}}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "ip", id: ip.id })
      }}>
        <FontAwesomeIcon icon={faServer}  />{' '}
        {ip.endereco}
      </div>,
      className: "ip " + (checked ? "checked " : ""),
      children: filhos
    }
  }

  return {
    getIp
  }
}

export default useElementoIp