"use client";
import { WhatwebResultadoResponse } from "@/types/WhatwebResultadoResponse";
import styled from "styled-components";

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: ${({ theme }) => theme.colors.foreground};

  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  }

  th {
    font-weight: 500;
    opacity: 0.9;
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

const CelulaDados = styled.td`
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.85rem;
  }
`;

type Props = { resultados?: WhatwebResultadoResponse[] };

const ListaTecnologias = ({ resultados }: Props) => {
  if (!resultados || resultados.length === 0) return <p>Nenhuma tecnologia detectada.</p>;

  return (
    <Tabela>
      <thead>
        <tr>
          <th>Fonte</th>
          <th>Valor</th>
          <th>Dados</th>
        </tr>
      </thead>
      <tbody>
        {resultados.map((resultado) => (
          <tr key={resultado.id ?? `${resultado.plugin}-${resultado.valor}`}>
            <td>{resultado.plugin}</td>
            <td>{resultado.valor}</td>
            <CelulaDados>
              <pre>{JSON.stringify(resultado.dados ?? {}, null, 2)}</pre>
            </CelulaDados>
          </tr>
        ))}
      </tbody>
    </Tabela>
  );
};

export default ListaTecnologias;
