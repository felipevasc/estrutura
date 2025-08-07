"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import styled from 'styled-components';
import { DominioResponse } from "@/types/DominioResponse";
import { RedeResponse } from "@/types/RedeResponse";

// Reusing styled components from VisualizarDominio for consistency
// In a real app, these would be in a shared styles file.
const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #f4f7f9;
  font-family: 'Roboto', sans-serif;
  color: #333;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    font-weight: 500;
    color: #2c3e50;
  }
  p {
    font-size: 1rem;
    color: #7f8c8d;
  }
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #34495e;
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 0.5rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid #ecf0f1;
  &:last-child {
    border-bottom: none;
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
