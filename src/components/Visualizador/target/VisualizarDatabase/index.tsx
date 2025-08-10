"use client";
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  height: 100%;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.accentColor};
  }
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.panelBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
`;

const VisualizarDatabase = () => {
    return (
        <DashboardContainer>
            <Header>
                <h1>Visualização de Banco de Dados</h1>
            </Header>
            <Card>
                <p>Esta funcionalidade ainda não foi implementada.</p>
            </Card>
        </DashboardContainer>
    );
};

export default VisualizarDatabase;
