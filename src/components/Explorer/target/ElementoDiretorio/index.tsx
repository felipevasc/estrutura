import StoreContext from "@/store";
import { DiretorioResponse } from "@/types/DiretorioResponse";
import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { NoCarregavel } from "../tipos";

const useElementoDiretorio = () => {
  const { selecaoTarget } = useContext(StoreContext);

  const getDiretorio = async (diretorio: DiretorioResponse): Promise<NoCarregavel> => {
    const selecionado = selecaoTarget?.get();
    const checked = selecionado?.tipo === "diretorio" && selecionado?.id === diretorio.id;

    const icone = diretorio.tipo === "arquivo" ? faFile : faFolder;

    return {
      key: `diretorio-${diretorio.id}`,
      title: (
        <div onClick={() => selecaoTarget?.set({ tipo: "diretorio", id: diretorio.id })}>
          <FontAwesomeIcon icon={icone} />{" "}
          {diretorio.caminho} <small>({diretorio.status} - {diretorio.tamanho}b)</small>
        </div>
      ),
      className: "diretorio " + (diretorio.tipo === "arquivo" ? "arquivo " : "") + (checked ? "checked " : ""),
      isLeaf: true
    };
  };

  return {
    getDiretorio
  };
};

export default useElementoDiretorio;
