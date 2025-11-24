import { ContainerRecon, ConteudoPrincipal, PainelLateral } from "./styles";
import Explorer from "@/components/Explorer";
import Visualizador from "@/components/Visualizador";
import Ferramentas from "@/components/Ferramentas";

export default function Reconhecimento() {
  return (
    <ContainerRecon>
      <PainelLateral>
        <Explorer />
      </PainelLateral>
      <ConteudoPrincipal>
        <Visualizador />
      </ConteudoPrincipal>
      <PainelLateral>
        <Ferramentas />
      </PainelLateral>
    </ContainerRecon>
  );
}
