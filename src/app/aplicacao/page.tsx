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

export default function Aplicacao() {
  return (
    <StyledEstruturaInicial>
      <Topo />
      <StyledEstruturaCentro>
        <StyledPainelEsquerdo>
          <Explorer />
          <MenuEsquerdo />
        </StyledPainelEsquerdo>
        <StyledConteudoPrincipal>
          <h1>Área de Conteúdo Principal</h1>
          <p>Aqui vai o conteúdo da aplicação.</p>
        </StyledConteudoPrincipal>
        <StyledPainelDireito>
          <h2>Painel Direito</h2>
          <p>Informações ou status aqui.</p>
        </StyledPainelDireito>
      </StyledEstruturaCentro>
      <Rodape />
    </StyledEstruturaInicial>
  );
}
