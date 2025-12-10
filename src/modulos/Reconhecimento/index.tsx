import { ContainerRecon, ConteudoPrincipal, PainelLateral, PainelInspector } from "./styles";
import Explorer from "@/components/Explorer";
import Workspace from "@/components/Workspace";
import Inspector from "@/components/Inspector";

export default function Reconhecimento() {
  return (
    <ContainerRecon>
      <PainelLateral>
        <Explorer />
      </PainelLateral>

      <ConteudoPrincipal>
        <Workspace />
      </ConteudoPrincipal>

      <PainelInspector>
        <Inspector />
      </PainelInspector>

    </ContainerRecon>
  );
}
