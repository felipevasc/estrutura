"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import styled from "styled-components";

const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  h1 {
    font-size: 2rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.accentColor};
  }
`;

const EtiquetaTipo = styled.span`
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.panelBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  font-weight: 600;
  text-transform: capitalize;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.panelBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s, border-color 0.3s;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.accentColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding-bottom: 0.75rem;
  transition: color 0.3s, border-color 0.3s;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
`;

const InfoItem = styled.div`
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

const VisualizarDiretorio = () => {
  const { selecaoTarget } = useContext(StoreContext);
  const api = useApi();
  const idDiretorio = selecaoTarget?.get()?.id;
  const { data: diretorio, isLoading, error } = api.diretorios.getDiretorio(idDiretorio);

  if (isLoading) return <DashboardContainer><h2>Carregando...</h2></DashboardContainer>;
  if (error) return <DashboardContainer><h2>Erro ao carregar dados do diretório.</h2></DashboardContainer>;
  if (!diretorio) return <DashboardContainer><h2>Nenhum diretório selecionado.</h2></DashboardContainer>;

  const tipo = diretorio.tipo === "arquivo" ? "Arquivo" : "Diretório";
  const alvo = diretorio.dominio ? diretorio.dominio.endereco : diretorio.ip?.endereco ?? "-";
  const status = diretorio.status ?? "-";
  const tamanho = diretorio.tamanho ? `${diretorio.tamanho} bytes` : "-";
  const criado = diretorio.createdAt ? new Date(diretorio.createdAt).toLocaleString() : "-";

  return (
    <DashboardContainer>
      <Header>
        <h1>{diretorio.caminho}</h1>
        <EtiquetaTipo>{tipo}</EtiquetaTipo>
      </Header>

      <Card>
        <CardTitle>Informações do Caminho</CardTitle>
        <InfoGrid>
          <InfoItem>
            <strong>Host</strong>
            <span>{alvo}</span>
          </InfoItem>
          <InfoItem>
            <strong>Tipo</strong>
            <span>{tipo}</span>
          </InfoItem>
          <InfoItem>
            <strong>Status HTTP</strong>
            <span>{status}</span>
          </InfoItem>
          <InfoItem>
            <strong>Tamanho</strong>
            <span>{tamanho}</span>
          </InfoItem>
          <InfoItem>
            <strong>Registrado em</strong>
            <span>{criado}</span>
          </InfoItem>
        </InfoGrid>
      </Card>
    </DashboardContainer>
  );
};

export default VisualizarDiretorio;
