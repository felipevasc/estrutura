import StoreContext from "@/store";
import { UsuarioResponse } from "@/types/UsuarioResponse";
import { faEthernet, faNetworkWired, faServer, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";
import useElementoPorta from "../ElementoPorta";

const useElementoUsuario = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoPorta = useElementoPorta();

  const getUsuario = async (usuario: UsuarioResponse): Promise<TreeDataNode> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "user" && selecionado?.id === usuario.id;

    const filhos: TreeDataNode[] = [];

    // Accesses IP
    if (usuario.ip) {
        const ip = usuario.ip;
        const ipChildren: TreeDataNode[] = [];

        // Services/Ports accessed via this IP
        if (ip.portas && ip.portas.length > 0) {
            const filhosPortas: TreeDataNode[] = [];
            for (const porta of ip.portas) {
                filhosPortas.push(await elementoPorta.getPorta(porta));
            }
             ipChildren.push({
                key: `user-${usuario.id}-ip-${ip.id}-portas`,
                title: <div><FontAwesomeIcon icon={faEthernet} /> Portas/Serviços</div>,
                children: filhosPortas,
                className: "folder"
            });
        }

        // Add IP node as a child of User
        filhos.push({
            key: `user-${usuario.id}-ip-${ip.id}`,
            title: <div><FontAwesomeIcon icon={faServer} /> {ip.endereco}</div>,
            children: ipChildren,
            className: "ip"
        });
    }

    return {
      key: `${usuario.nome}-${usuario.id}}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "user", id: usuario.id })
      }}>
        <FontAwesomeIcon icon={faUser} />{' '}
        {usuario.nome}
      </div>,
      children: filhos,
      className: "usuario " + (checked ? "checked " : ""),
    };
  };

  return { getUsuario };
};

export default useElementoUsuario;
