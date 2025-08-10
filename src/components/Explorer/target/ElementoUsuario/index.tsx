import StoreContext from "@/store";
import { UsuarioResponse } from "@/types/UsuarioResponse";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";

const useElementoUsuario = () => {
  const { selecaoTarget } = useContext(StoreContext);

  const getUsuario = async (usuario: UsuarioResponse): Promise<TreeDataNode> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "user" && selecionado?.id === usuario.id;

    return {
      key: `${usuario.nome}-${usuario.id}}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "user", id: usuario.id })
      }}>
        <FontAwesomeIcon icon={faUser} />{' '}
        {usuario.nome}
      </div>,
      className: "usuario " + (checked ? "checked " : ""),
    };
  };

  return { getUsuario };
};

export default useElementoUsuario;
