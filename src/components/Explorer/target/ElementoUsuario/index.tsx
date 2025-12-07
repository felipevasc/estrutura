import StoreContext from "@/store";
import { IpResponse } from "@/types/IpResponse";
import { UsuarioResponse } from "@/types/UsuarioResponse";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { NoCarregavel } from "../tipos";
type OpcoesElementoUsuario = {
  obterIp?: (ip: IpResponse, anteriores?: string[]) => Promise<NoCarregavel>;
};

const useElementoUsuario = (opcoes?: OpcoesElementoUsuario) => {
  const { selecaoTarget } = useContext(StoreContext);
  const { obterIp } = opcoes ?? {};

  const getUsuario = async (usuario: UsuarioResponse): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "user" && selecionado?.id === usuario.id;
    const possuiIp = !!usuario.ip && !!obterIp;

    const carregar = async () => {
      const filhos: NoCarregavel[] = [];
      if (usuario.ip && obterIp) {
        const ip = await obterIp(usuario.ip, ["usuario"]);
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
