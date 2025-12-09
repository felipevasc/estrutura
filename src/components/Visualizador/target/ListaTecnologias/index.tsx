"use client";
import { WhatwebResultadoResponse } from "@/types/WhatwebResultadoResponse";
import { Fragment } from "react";
import { JsonView, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
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

const LinhaDados = styled.tr`
  td {
    padding-top: 0;
  }
`;

const BlocoDados = styled.div`
  padding: 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

type Props = { resultados?: WhatwebResultadoResponse[] };

const normalizarDados = (dados: unknown) => {
  if (dados === null || dados === undefined) return {};
  if (typeof dados === "string") {
    try {
      return JSON.parse(dados);
    } catch {
      return dados;
    }
  }
  return dados;
};

const ListaTecnologias = ({ resultados }: Props) => {
  if (!resultados || resultados.length === 0) return <p>Nenhuma tecnologia detectada.</p>;

  return (
    <Tabela>
      <thead>
        <tr>
          <th>Fonte</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        {resultados.map((resultado) => (
          <Fragment key={resultado.id ?? `${resultado.plugin}-${resultado.valor}`}>
            <tr>
              <td>{resultado.plugin}</td>
              <td>{resultado.valor}</td>
            </tr>
            <LinhaDados>
              <td colSpan={2}>
                <BlocoDados>
                  <JsonView style={defaultStyles} value={normalizarDados(resultado.dados)} />
                </BlocoDados>
              </td>
            </LinhaDados>
          </Fragment>
        ))}
      </tbody>
    </Tabela>
  );
};

export default ListaTecnologias;
