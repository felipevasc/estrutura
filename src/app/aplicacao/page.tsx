"use client"
import { useState } from "react";
import { StyledEstruturaInicial } from "./styles";
import Topo from "@/layout/Topo";
import Rodape from "@/layout/Rodape";
import QueueStatus from "@/components/QueueStatus";
import ChatWidget from "@/components/Chat";
import Navegacao from "@/components/Navegacao";
import Reconhecimento from "@/modulos/Reconhecimento";
import Exploracao from "@/modulos/Exploracao";
import Cti from "@/modulos/Cti";
import Relatorios from "@/modulos/Relatorios";
import '@ant-design/v5-patch-for-react-19';

export default function Aplicacao() {
  const [abaAtiva, setAbaAtiva] = useState('RECONHECIMENTO');

  const renderizarModulo = () => {
    switch (abaAtiva) {
      case 'RECONHECIMENTO': return <Reconhecimento />;
      case 'EXPLORACAO': return <Exploracao />;
      case 'CTI': return <Cti />;
      case 'RELATORIOS': return <Relatorios />;
      default: return <Reconhecimento />;
    }
  };

  return (
    <>
      <StyledEstruturaInicial>
        <Topo />
        <Navegacao abaAtiva={abaAtiva} aoTrocarAba={setAbaAtiva} />
        {renderizarModulo()}
        <Rodape />
      </StyledEstruturaInicial>
      <QueueStatus />
      <ChatWidget />
    </>
  );
}
