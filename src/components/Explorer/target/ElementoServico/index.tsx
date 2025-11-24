import StoreContext from "@/store";
import { PortaResponse } from "@/types/PortaResponse";
import { faServer, faUser, faCogs } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";

const useElementoServico = () => {
  const { selecaoTarget } = useContext(StoreContext);

  const getServico = async (nomeServico: string, portas: PortaResponse[]): Promise<TreeDataNode> => {
    // Structure: Service Name -> IPs -> Users

    // Group ports by IP
    const ipMap = new Map<number, { ip: any, portas: PortaResponse[] }>();

    portas.forEach(p => {
        if (p.ipId && p.ip) {
            if (!ipMap.has(p.ipId)) {
                ipMap.set(p.ipId, { ip: p.ip, portas: [] });
            }
            ipMap.get(p.ipId)?.portas.push(p);
        }
    });

    const filhosIps: TreeDataNode[] = [];

    for (const [ipId, data] of ipMap) {
        const { ip } = data;
        const filhosUsers: TreeDataNode[] = [];

        if (ip.usuarios && ip.usuarios.length > 0) {
            ip.usuarios.forEach((u: any) => {
                filhosUsers.push({
                    key: `service-${nomeServico}-ip-${ipId}-user-${u.id}`,
                    title: <div><FontAwesomeIcon icon={faUser} /> {u.nome}</div>,
                    isLeaf: true
                });
            });
        }

        filhosIps.push({
            key: `service-${nomeServico}-ip-${ipId}`,
            title: <div><FontAwesomeIcon icon={faServer} /> {ip.endereco} <span style={{fontSize: '0.8em', color: '#888'}}>({data.portas.map(p => p.numero).join(', ')})</span></div>,
            children: filhosUsers.length > 0 ? filhosUsers : undefined,
            isLeaf: filhosUsers.length === 0
        });
    }

    return {
      key: `service-${nomeServico}`,
      title: <div><FontAwesomeIcon icon={faCogs} /> {nomeServico}</div>,
      children: filhosIps,
      className: "servico"
    };
  };

  return { getServico };
};

export default useElementoServico;
