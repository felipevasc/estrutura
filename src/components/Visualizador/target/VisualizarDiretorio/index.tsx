"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import styled from "styled-components";

const Painel = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  height: 100%;
  overflow-y: auto;
`;

const Cabecalho = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.accentColor};
  }
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.foreground};
    opacity: 0.8;
  }
`;

const Cartao = styled.div`
  background-color: ${({ theme }) => theme.colors.panelBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s, border-color 0.3s;
`;

const Titulo = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.accentColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding-bottom: 0.75rem;
  transition: color 0.3s, border-color 0.3s;
`;

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
`;

const Item = styled.div`
  strong {
    display: block;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.foreground};
    opacity: 0.9;
    margin-bottom: 0.35rem;
  }
  span {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

const Selo = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: ${({ theme }) => theme.colors.panelBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const VisualizarDiretorio = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const api = useApi();
    const idDiretorio = selecaoTarget?.get()?.id;
    const { data: diretorio, isLoading, error } = api.diretorios.useDiretorio(idDiretorio);

    if (isLoading) return <Painel><h2>Carregando...</h2></Painel>;
    if (error) return <Painel><h2>Erro ao carregar dados do diretório.</h2></Painel>;
    if (!diretorio) return <Painel><h2>Nenhum diretório selecionado.</h2></Painel>;

    const alvo = diretorio.dominio?.endereco || diretorio.ip?.endereco || "Alvo desconhecido";
    const tipo = diretorio.tipo === "arquivo" ? "Arquivo" : "Diretório";
    const status = diretorio.status !== null && diretorio.status !== undefined ? diretorio.status : "N/A";
    const tamanho = diretorio.tamanho !== null && diretorio.tamanho !== undefined ? `${diretorio.tamanho}b` : "N/A";
    const criadoEm = diretorio.criadoEm ? new Date(diretorio.criadoEm).toLocaleString() : "N/A";

    return (
        <Painel>
            <Cabecalho>
                <h1>{diretorio.caminho}</h1>
                <p>Detalhes do caminho encontrado via fuzzing</p>
            </Cabecalho>

            <Cartao>
                <Titulo>Resumo</Titulo>
                <Grade>
                    <Item>
                        <strong>Tipo</strong>
                        <Selo>{tipo}</Selo>
                    </Item>
                    <Item>
                        <strong>Alvo</strong>
                        <span>{alvo}</span>
                    </Item>
                    <Item>
                        <strong>Status HTTP</strong>
                        <span>{status}</span>
                    </Item>
                    <Item>
                        <strong>Tamanho</strong>
                        <span>{tamanho}</span>
                    </Item>
                    <Item>
                        <strong>Registrado em</strong>
                        <span>{criadoEm}</span>
                    </Item>
                </Grade>
            </Cartao>

            <Cartao>
                <Titulo>Associação</Titulo>
                <Grade>
                    <Item>
                        <strong>Domínio</strong>
                        <span>{diretorio.dominio?.endereco || "N/A"}</span>
                    </Item>
                    <Item>
                        <strong>IP</strong>
                        <span>{diretorio.ip?.endereco || "N/A"}</span>
                    </Item>
                </Grade>
            </Cartao>
        </Painel>
    );
};

export default VisualizarDiretorio;
