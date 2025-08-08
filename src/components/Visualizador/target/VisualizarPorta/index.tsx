"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import styled from 'styled-components';

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

const VisualizarPorta = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const api = useApi();
    const idPorta = selecaoTarget?.get()?.id;
    const { data: porta, isLoading, error } = api.portas.getPorta(idPorta);

    if (isLoading) return <DashboardContainer><h2>Carregando...</h2></DashboardContainer>;
    if (error) return <DashboardContainer><h2>Erro ao carregar dados da porta.</h2></DashboardContainer>;
    if (!porta) return <DashboardContainer><h2>Nenhuma porta selecionada.</h2></DashboardContainer>;

    return (
        <DashboardContainer>
            <Header>
                <h1>{porta.numero}/{porta.protocolo}</h1>
                <p>Informações da Porta</p>
            </Header>
            <List>
                <ListItem>Serviço: {porta.servico}</ListItem>
                <ListItem>Estado: {porta.estado}</ListItem>
                {porta.ip && <ListItem>IP: {porta.ip.endereco}</ListItem>}
            </List>
        </DashboardContainer>
    );
}

export default VisualizarPorta;

