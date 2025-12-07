import StoreContext from "@/store";
import { UsuarioResponse } from "@/types/UsuarioResponse";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { NoCarregavel } from "../tipos";
import useElementoIp from "../ElementoIp";

const useElementoUsuario = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoIp = useElementoIp();

  const getUsuario = async (usuario: UsuarioResponse): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "user" && selecionado?.id === usuario.id;
    const possuiIp = !!usuario.ip;

    const carregar = async () => {
      const filhos: NoCarregavel[] = [];
      if (usuario.ip) {
        const ip = await elementoIp.getIp(usuario.ip, ["usuario"]);
        filhos.push(ip);
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
