import StoreContext from "@/store";
import { DiretorioResponse } from "@/types/DiretorioResponse";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";

const useElementoDiretorio = () => {
  const { selecaoTarget } = useContext(StoreContext);

  const selecionado = selecaoTarget?.get();

  const getDiretorio = async (diretorio: DiretorioResponse): Promise<TreeDataNode> => {
    const checked = selecionado?.tipo === "diretorio" && selecionado?.id === diretorio.id;

    return {
      key: `diretorio-${diretorio.id}`,
      title: (
        <div onClick={() => selecaoTarget?.set({ tipo: "diretorio", id: diretorio.id })}>
          <FontAwesomeIcon icon={faFolder} />{" "}
          {diretorio.caminho} <small>({diretorio.status} - {diretorio.tamanho}b)</small>
        </div>
      ),
      className: "diretorio " + (checked ? "checked " : ""),
      isLeaf: true
    };
  };

  return {
    getDiretorio
  };
};

export default useElementoDiretorio;
