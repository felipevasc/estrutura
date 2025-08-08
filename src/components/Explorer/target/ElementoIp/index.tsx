import StoreContext from "@/store";
import { IpResponse } from "@/types/IpResponse";
import { PortaResponse } from "@/types/PortaResponse";
import { faPlug, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";

const useElementoIp = () => {
  const { selecaoTarget } = useContext(StoreContext);

  const selecionado = selecaoTarget?.get();

  const getIp = async (ip: IpResponse): Promise<TreeDataNode> => {
    const checked = selecionado?.tipo === "ip" && selecionado?.id === ip.id;

    const filhos: TreeDataNode[] = [];

    const portas = ip.portas ?? [];
    if (portas.length) {
      const filhosPortas: TreeDataNode[] = portas.map((porta: PortaResponse) => ({
        key: `${ip.endereco}-${ip.id}-porta-${porta.id}`,
        title: <div onClick={() => selecaoTarget?.set({ tipo: "port", id: porta.id })}>
          <FontAwesomeIcon icon={faPlug} />{' '}{porta.numero}/{porta.protocolo}{porta.servico ? ` - ${porta.servico}` : ''}
        </div>,
        className: "porta " + (selecionado?.tipo === 'port' && selecionado?.id === porta.id ? 'checked ' : ''),
      }));
      filhos.push({
        key: `${ip.endereco}-${ip.id}-portas`,
        title: <div><FontAwesomeIcon icon={faPlug} />{' '}Portas</div>,
        className: "folder",
        children: filhosPortas
      });
    }

    return {
      key: `${ip.endereco}-${ip.id}}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "ip", id: ip.id })
      }}>
        <FontAwesomeIcon icon={faServer} />{' '}
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