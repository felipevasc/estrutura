"use client";
import styled from 'styled-components';
import { PortaResponse } from '@/types/PortaResponse';

const Table = styled.table`
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

interface VisualizarPortasProps {
    portas: PortaResponse[];
}

const VisualizarPortas = ({ portas }: VisualizarPortasProps) => {
    if (!portas || portas.length === 0) {
        return <p>Nenhuma porta aberta encontrada.</p>;
    }

    return (
        <Table>
            <thead>
                <tr>
                    <th>Porta</th>
                    <th>Protocolo</th>
                    <th>Serviço</th>
                    <th>Versão</th>
                </tr>
            </thead>
            <tbody>
                {portas.map((porta) => (
                    <tr key={porta.id}>
                        <td>{porta.numero}</td>
                        <td>{porta.protocolo || 'N/A'}</td>
                        <td>{porta.servico || 'N/A'}</td>
                        <td>{porta.versao || 'N/A'}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default VisualizarPortas;
