import StoreContext from "@/store";
import { UsuarioResponse } from "@/types/UsuarioResponse";
import { faEthernet, faServer, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import useElementoPorta from "../ElementoPorta";
import { NoCarregavel } from "../tipos";

const useElementoUsuario = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoPorta = useElementoPorta();

  const getUsuario = async (usuario: UsuarioResponse): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "user" && selecionado?.id === usuario.id;
    const possuiIp = !!usuario.ip;

    const carregar = async () => {
      const filhos: NoCarregavel[] = [];
      if (usuario.ip) {
        const ip = usuario.ip;
        const filhosIp: NoCarregavel[] = [];
        const portas = ip.portas ?? [];

        if (portas.length) {
          const filhosPortas: NoCarregavel[] = [];
          for (const porta of portas) {
            filhosPortas.push(await elementoPorta.getPorta(porta));
          }
          filhosIp.push({
            key: `user-${usuario.id}-ip-${ip.id}-portas`,
            title: <div><FontAwesomeIcon icon={faEthernet} /> Portas/Serviços</div>,
            children: filhosPortas,
            className: "folder",
            isLeaf: filhosPortas.length === 0
          });
        }

        filhos.push({
          key: `user-${usuario.id}-ip-${ip.id}`,
          title: <div><FontAwesomeIcon icon={faServer} /> {ip.endereco}</div>,
          children: filhosIp.length ? filhosIp : undefined,
          className: "ip",
          isLeaf: filhosIp.length === 0
        });
      }

      return filhos;
    };

    return {
      key: `${usuario.nome}-${usuario.id}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "user", id: usuario.id });
      }}>
        <FontAwesomeIcon icon={faUser} />{" "}
        {usuario.nome}
      </div>,
      children: possuiIp ? undefined : [],
      className: "usuario " + (checked ? "checked " : ""),
      isLeaf: !possuiIp,
      carregar: possuiIp ? carregar : undefined
    };
  };

  return { getUsuario };
};

export default useElementoUsuario;
