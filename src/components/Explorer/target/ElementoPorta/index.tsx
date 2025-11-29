import StoreContext from "@/store";
import { PortaResponse } from "@/types/PortaResponse";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { NoCarregavel } from "../tipos";

const useElementoPorta = () => {
  const { selecaoTarget } = useContext(StoreContext);

  const getPorta = async (porta: PortaResponse): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "porta" && selecionado?.id === porta.id;

    return {
      key: `${porta.numero}-${porta.id}`,
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "porta", id: porta.id });
      }}>
        <FontAwesomeIcon icon={faCircleNotch} />{" "}
        {porta.numero}{porta.protocolo ? "/" + porta.protocolo : ""}
      </div>,
      className: "porta " + (checked ? "checked " : ""),
      isLeaf: true
    };
  };

  return {
    getPorta
  };
};

export default useElementoPorta;
