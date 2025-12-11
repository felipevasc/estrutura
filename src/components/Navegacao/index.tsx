import { ContainerNavegacao, Aba } from "./styles";

interface Props {
  abaAtiva: string;
  aoTrocarAba: (aba: string) => void;
}

export default function Navegacao({ abaAtiva, aoTrocarAba }: Props) {
  const abas = [
    { id: 'RECONHECIMENTO', label: 'RECON' },
    { id: 'EXPLORACAO', label: 'EXPLOITATION' },
    { id: 'CTI', label: 'CTI' },
    { id: 'SENTINELA', label: 'SENTINELA' },
    { id: 'RELATORIOS', label: 'REPORTS' },
  ];

  return (
    <ContainerNavegacao>
      {abas.map(aba => (
        <Aba
          key={aba.id}
          $ativo={abaAtiva === aba.id}
          onClick={() => aoTrocarAba(aba.id)}
        >
          {aba.label}
        </Aba>
      ))}
    </ContainerNavegacao>
  );
}
