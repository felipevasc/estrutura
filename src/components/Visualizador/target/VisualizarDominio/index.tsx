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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  strong {
    display: block;
    font-weight: 500;
    color: #555;
    margin-bottom: 0.25rem;
  }
  span {
    font-size: 0.9rem;
  }
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

const VisualizarDominio = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const api = useApi();
    const idDominio = selecaoTarget?.get()?.id;
    const { data: dominio, isLoading, error } = api.dominios.getDominio(idDominio);

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