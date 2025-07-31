import { StyledEstruturaCentro, StyledEstruturaInicial } from "./styles";
import Topo from "@/layout/Topo";
import MenuEsquerdo from "@/layout/MenuEsquerdo";
import Rodape from "@/layout/Rodape";

export default function Aplicacao() {
  return (
    <StyledEstruturaInicial>
      <Topo />
      <StyledEstruturaCentro>
        <MenuEsquerdo />
        <div>Conteudo</div>
        <div>1</div>
      </StyledEstruturaCentro>
      <Rodape />
    </StyledEstruturaInicial>
  );
}
