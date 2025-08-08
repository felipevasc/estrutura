import useApi from "@/api";
import StoreContext from "@/store";
import { IpResponse } from "@/types/IpResponse";
import { faServer, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";

const useElementoIp = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const api = useApi();

  const selecionado = selecaoTarget?.get()

  const getIp = async (ip: IpResponse): Promise<TreeDataNode> => {
    // Fetch full IP details including ports
    const ipDetails = await api.ips.getIp(ip.id);
    const checked = selecionado?.tipo === "ip" && selecionado?.id === ip.id;
    
    const filhos: TreeDataNode[] = ipDetails?.portas?.map((porta: any) => ({
      key: `porta-${porta.id}`,
      title: (
        <div onClick={() => selecaoTarget?.set({ tipo: "porta", id: porta.id })}>
          <FontAwesomeIcon icon={faDoorOpen} />{' '}
          {porta.numero}/{porta.protocolo} - {porta.servico}
        </div>
      ),
      className: "porta " + (selecionado?.tipo === "porta" && selecionado?.id === porta.id ? "checked " : ""),
      isLeaf: true,
    })) || [];
    
    return {
      key: `ip-${ip.id}`,
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

export default useElementoIp;