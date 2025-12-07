"use client"
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { StyledEstruturaInicial, ModuloContainer } from "./styles";
import Topo from "@/layout/Topo";
import Rodape from "@/layout/Rodape";
import Navegacao from "@/components/Navegacao";
import '@ant-design/v5-patch-for-react-19';

const Reconhecimento = dynamic(() => import("@/modulos/Reconhecimento"));
const Exploracao = dynamic(() => import("@/modulos/Exploracao"));
const Cti = dynamic(() => import("@/modulos/Cti"));
const Relatorios = dynamic(() => import("@/modulos/Relatorios"));
const ChatDinamico = dynamic(() => import("@/components/Chat"), { ssr: false });
const ConfiguracoesDinamicas = dynamic(() => import("@/components/Configuracoes"), { ssr: false });

export default function Aplicacao() {
  const [abaAtiva, setAbaAtiva] = useState('RECONHECIMENTO');

  const moduloAtual = useMemo(() => {
    switch (abaAtiva) {
      case 'EXPLORACAO':
        return <Exploracao />;
      case 'CTI':
        return <Cti />;
      case 'RELATORIOS':
        return <Relatorios />;
      default:
        return <Reconhecimento />;
    }
  }, [abaAtiva]);

  return (
    <>
        <StyledEstruturaInicial>
          <Topo />
          <Navegacao abaAtiva={abaAtiva} aoTrocarAba={setAbaAtiva} />
          <ModuloContainer>
            {moduloAtual}
          </ModuloContainer>
          <Rodape />
        </StyledEstruturaInicial>
      <ChatDinamico />
      <ConfiguracoesDinamicas />
    </>
  );
}
