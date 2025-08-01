import {
  StyledEstruturaCentro,
  StyledEstruturaInicial,
  StyledConteudoPrincipal,
  StyledPainelDireito,
} from "./styles";
import Topo from "@/layout/Topo";
import MenuEsquerdo from "@/layout/MenuEsquerdo";
import Rodape from "@/layout/Rodape";

export default function Aplicacao() {
  return (
    <StyledEstruturaInicial>
      <Topo />
      <StyledEstruturaCentro>
        <MenuEsquerdo />
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
