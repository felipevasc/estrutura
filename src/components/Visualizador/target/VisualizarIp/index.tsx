"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import styled from 'styled-components';
import { DominioResponse } from "@/types/DominioResponse";
import { RedeResponse } from "@/types/RedeResponse";
import VisualizarPortas from "./VisualizarPortas";

// NOTE: These styled components are duplicated from VisualizarDominio.
// In a real-world refactor, they should be moved to a common/shared file
// to avoid code duplication. For this task, we will update them here directly.

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

const VisualizarIp = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const api = useApi();
    const idIp = selecaoTarget?.get()?.id;
    const { data: ip, isLoading, error } = api.ips.getIp(idIp);

    if (isLoading) return <DashboardContainer><h2>Carregando...</h2></DashboardContainer>;
    if (error) return <DashboardContainer><h2>Erro ao carregar dados do IP.</h2></DashboardContainer>;
    if (!ip) return <DashboardContainer><h2>Nenhum IP selecionado.</h2></DashboardContainer>;

    return (
        <DashboardContainer>
            <Header>
                <h1>{ip.endereco}</h1>
                <p>Dashboard de informações do Endereço IP</p>
            </Header>

            <Card>
                <CardTitle>Portas Abertas</CardTitle>
                <VisualizarPortas portas={ip.portas || []} />
            </Card>

            <Card>
                <CardTitle>Domínios Associados</CardTitle>
                {ip.dominios && ip.dominios.length > 0 ? (
                    <List>
                        {ip.dominios.map((dominio: DominioResponse) => (
                            <ListItem key={dominio.id}>{dominio.endereco}</ListItem>
                        ))}
                    </List>
                ) : (
                    <p>Nenhum domínio associado encontrado.</p>
                )}
            </Card>

            <Card>
                <CardTitle>Redes Associadas</CardTitle>
                {ip.redes && ip.redes.length > 0 ? (
                    <List>
                        {ip.redes.map((rede: RedeResponse) => (
                            <ListItem key={rede.id}>{rede.cidr}</ListItem>
                        ))}
                    </List>
                ) : (
                    <p>Nenhuma rede associada encontrada.</p>
                )}
            </Card>
        </DashboardContainer>
    );
}

export default VisualizarIp;
