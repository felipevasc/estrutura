import StoreContext from "@/store";
import { PortaResponse } from "@/types/PortaResponse";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { NoCarregavel } from "../tipos";
import useElementoWhatweb from "../ElementoWhatweb";

const useElementoPorta = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const elementoWhatweb = useElementoWhatweb();

  const getPorta = async (porta: PortaResponse): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "porta" && selecionado?.id === porta.id;
    const possuiWhatweb = (porta.whatwebResultados?.length ?? 0) > 0;

    const carregar = async () => {
      const filhos: NoCarregavel[] = [];
      if (possuiWhatweb) {
        const pasta = elementoWhatweb.getResultados(porta.whatwebResultados ?? [], `${porta.numero}-${porta.id}`);
        if (pasta) filhos.push(pasta);
      }
      return filhos;
    };

    return {
      key: `${porta.numero}-${porta.id}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "porta", id: porta.id });
      }}>
        <FontAwesomeIcon icon={faCircleNotch} />{" "}
        {porta.numero}{porta.protocolo ? "/" + porta.protocolo : ""}
      </div>,
      className: "porta " + (checked ? "checked " : ""),
      isLeaf: !possuiWhatweb,
      carregar: possuiWhatweb ? carregar : undefined
    };
  };

  return {
    getPorta
  };
};

export default useElementoPorta;
