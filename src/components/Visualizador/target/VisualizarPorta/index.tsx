"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background-color: #f4f7f9;
  font-family: 'Roboto', sans-serif;
  color: #333;
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

const VisualizarPorta = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const api = useApi();
    const idPorta = selecaoTarget?.get()?.id;
    const { data: porta, isLoading, error } = api.portas.getPorta(idPorta);

    if (isLoading) return <Container><h2>Carregando...</h2></Container>;
    if (error) return <Container><h2>Erro ao carregar dados da porta.</h2></Container>;
    if (!porta) return <Container><h2>Nenhuma porta selecionada.</h2></Container>;

    return (
        <Container>
            <Card>
                <CardTitle>Detalhes da Porta</CardTitle>
                <p><strong>Porta:</strong> {porta.numero}/{porta.protocolo}</p>
                <p><strong>Serviço:</strong> {porta.servico}</p>
                <p><strong>Estado:</strong> {porta.estado}</p>
                {porta.ip && <p><strong>IP:</strong> {porta.ip.endereco}</p>}
            </Card>
        </Container>
    );
}

export default VisualizarPorta;
