"use client"
import {
  StyledEstruturaCentro,
  StyledEstruturaInicial,
  StyledConteudoPrincipal,
  StyledPainelDireito,
  StyledPainelEsquerdo,
} from "./styles";
import Topo from "@/layout/Topo";
import MenuEsquerdo from "@/layout/MenuEsquerdo";
import Rodape from "@/layout/Rodape";
import Explorer from "@/components/Explorer";
import Visualizador from "@/components/Visualizador";
import Ferramentas from "@/components/Ferramentas";
import QueueStatus from "@/components/QueueStatus";

export default function Aplicacao() {
  return (
    <>
      <StyledEstruturaInicial>
        <Topo />
        <StyledEstruturaCentro>
          <StyledPainelEsquerdo>
            <Explorer />
          </StyledPainelEsquerdo>
          <StyledConteudoPrincipal>
            <Visualizador />
          </StyledConteudoPrincipal>
          <StyledPainelDireito>
            <Ferramentas />
          </StyledPainelDireito>
        </StyledEstruturaCentro>
        <Rodape />
      </StyledEstruturaInicial>
      <QueueStatus />
    </>
  );
}
