import StoreContext from "@/store";
import { DominioResponse } from "@/types/DominioResponse"
import { GlobalOutlined } from "@ant-design/icons";
import { TreeDataNode } from "antd";
import React, { useContext } from "react";

type ElementoDominioProps = {
  dominio: DominioResponse;
}

const useElementoDominio = () => {
  const { selecaoTarget } = useContext(StoreContext);

  const selecionado = selecaoTarget?.get()

  const getDominio = (dominio: DominioResponse): TreeDataNode => {
    const checked = selecionado?.tipo === "domain" && selecionado?.id === dominio.id;
    return {
      key: dominio.id ?? "",
      title: <div onClick={() => {
        selecaoTarget?.set({ tipo: "domain", id: dominio.id })
      }}>
        <GlobalOutlined />{' '}
        {dominio.endereco}
      </div>,
      className: "dominio " + (checked ? "checked " : ""),
      children: dominio.subDominios?.map((d) => getDominio(d))
    }
  }

  return {
    getDominio
  }
}

export default useElementoDominio