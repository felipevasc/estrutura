"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import styled from 'styled-components';
import { DominioResponse } from "@/types/DominioResponse";
import { IpResponse } from "@/types/IpResponse";

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
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
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  padding: 0.75rem 0.25rem;
  color: ${({ theme }) => theme.colors.foreground};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  transition: background-color 0.3s, border-color 0.3s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

const VisualizarDominio = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const api = useApi();
    const idDominio = selecaoTarget?.get()?.id;
    const { data: dominio, isLoading, error } = api.dominios.useDominio(idDominio);

    if (isLoading) return <DashboardContainer><h2>Carregando...</h2></DashboardContainer>;
    if (error) return <DashboardContainer><h2>Erro ao carregar dados do domínio.</h2></DashboardContainer>;
    if (!dominio) return <DashboardContainer><h2>Nenhum domínio selecionado.</h2></DashboardContainer>;

    return (
        <DashboardContainer>
            <Header>
                <h1>{dominio.alias || dominio.endereco}</h1>
                <p>Dashboard de informações do domínio</p>
            </Header>

            <Card>
                <CardTitle>Informações Gerais</CardTitle>
                <InfoGrid>
                    <InfoItem>
                        <strong>Endereço</strong>
                        <span>{dominio.endereco}</span>
                    </InfoItem>
                    {dominio.alias && <InfoItem>
                        <strong>Alias</strong>
                        <span>{dominio.alias}</span>
                    </InfoItem>}
                </InfoGrid>
            </Card>

            <Card>
                <CardTitle>Subdomínios</CardTitle>
                {dominio.subDominios && dominio.subDominios.length > 0 ? (
                    <List>
                        {dominio.subDominios.map((sub: DominioResponse) => (
                            <ListItem key={sub.id}>{sub.endereco}</ListItem>
                        ))}
                    </List>
                ) : (
                    <p>Nenhum subdomínio encontrado.</p>
                )}
            </Card>

            <Card>
                <CardTitle>Endereços IP Associados</CardTitle>
                {dominio.ips && dominio.ips.length > 0 ? (
                    <List>
                        {dominio.ips.map((ip: IpResponse) => (
                            <ListItem key={ip.id}>{ip.endereco}</ListItem>
                        ))}
                    </List>
                ) : (
                    <p>Nenhum endereço IP associado.</p>
                )}
            </Card>
        </DashboardContainer>
    );
}

export default VisualizarDominio;