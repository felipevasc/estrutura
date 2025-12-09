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
  if (dados === null || dados === undefined) return null;
  if (typeof dados === "string") {
    const valorTratado = dados.trim();
    if (!valorTratado || valorTratado === "undefined" || valorTratado === "null") return null;
    try {
      return JSON.parse(valorTratado);
    } catch {
      return valorTratado.startsWith("{") || valorTratado.startsWith("[") ? valorTratado : null;
    }
  }
  return dados;
};

const obterDadosUnicos = (resultados: WhatwebResultadoResponse[]) => {
  const dados: unknown[] = [];
  const vistos = new Set<string>();

  resultados.forEach((resultado) => {
    const origem = resultado.dados ?? (resultado.valor?.trim().match(/^[{[]/) ? resultado.valor : null);
    const dadoNormalizado = normalizarDados(origem);
    if (dadoNormalizado === null) return;

    const chave = typeof dadoNormalizado === "string" ? dadoNormalizado : JSON.stringify(dadoNormalizado);
    if (!chave || vistos.has(chave)) return;

    vistos.add(chave);
    dados.push(dadoNormalizado);
  });

  return dados;
};

const ListaTecnologias = ({ resultados }: Props) => {
  if (!resultados || resultados.length === 0) return <p>Nenhuma tecnologia detectada.</p>;

  const dados = obterDadosUnicos(resultados);

  const formatarValor = (valor?: string) => {
    if (!valor) return "-";
    const valorTratado = valor.trim();
    return !valorTratado || valorTratado === "undefined" || valorTratado === "null" ? "-" : valorTratado;
  };

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
              <td>{formatarValor(resultado.valor)}</td>
            </tr>
          </Fragment>
        ))}
      </tbody>
      {dados.length > 0 && (
        <tfoot>
          <LinhaDados>
            <td colSpan={2}>
	      {dados.map((dado, indice) => (
                <BlocoDados key={indice}>
                  <JsonView style={defaultStyles} value={dado} />
                </BlocoDados>
              ))}
            </td>
          </LinhaDados>
        </tfoot>
      )}
    </Tabela>
  );
};

export default ListaTecnologias;
