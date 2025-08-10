"use client";
import { Tree, TreeDataNode } from "antd";
import { useContext, useEffect, useState } from "react";
import { StyledArvoreUsuario, StyledTitleUsuario } from "./styles";
import StoreContext from "@/store";
import useApi from "@/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const ArvoreUsuarios = () => {
  const api = useApi();
  const { projeto, selecaoTarget } = useContext(StoreContext);
  const { data: usuariosProjeto } = api.usuarios.getUsuariosProjeto(projeto?.get()?.id);
  const [elementos, setElementos] = useState<TreeDataNode[]>([]);

  useEffect(() => {
    const elems: TreeDataNode[] = [];
    usuariosProjeto?.forEach((u) => {
      elems.push({
        key: `${u.nome}-${u.id}`,
        title: (
          <div
            onClick={() => {
              selecaoTarget?.set({ tipo: "user", id: u.id });
            }}
          >
            <FontAwesomeIcon icon={faUser} /> {u.nome}
          </div>
        ),
        className: "usuario",
      });
    });
    setElementos(elems);
  }, [usuariosProjeto]);

  return (
    <StyledArvoreUsuario>
      <StyledTitleUsuario>usuário</StyledTitleUsuario>
      <Tree treeData={elementos} showIcon={true} />
    </StyledArvoreUsuario>
  );
};

export default ArvoreUsuarios;
