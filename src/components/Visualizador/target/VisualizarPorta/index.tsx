"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext, useState } from "react";
import styled from "styled-components";
import { Button, Image, Space, message } from "antd";
import ListaTecnologias from "../ListaTecnologias";
import { PictureOutlined, ReloadOutlined } from "@ant-design/icons";

const Painel = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  height: 100%;
  overflow-y: auto;
`;

const Cabecalho = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  h1 {
    font-size: 2rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.accentColor};
    margin: 0;
  }
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.foreground};
    opacity: 0.8;
    margin: 0;
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

const Titulo = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.accentColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
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

const Figura = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 10px;
  padding: 12px;
  min-height: 240px;
`;

const VisualizarPorta = () => {
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const api = useApi();
    const idPorta = selecaoTarget?.get()?.id;
    const projetoId = projeto?.get()?.id;
    const { data: porta, isLoading, error, refetch } = api.portas.usePorta(idPorta);
    const [capturando, setCapturando] = useState(false);

    if (isLoading) return <Painel><h2>Carregando...</h2></Painel>;
    if (error) return <Painel><h2>Erro ao carregar dados da porta.</h2></Painel>;
    if (!porta) return <Painel><h2>Nenhuma porta selecionada.</h2></Painel>;

    const identificacao = `${porta.numero}${porta.protocolo ? `/${porta.protocolo}` : ""}`;
    const servico = porta.servico || "N/A";
    const versao = porta.versao || "N/A";
    const alvo = porta.ip?.endereco || "N/A";
    const capturadoEm = porta.capturadoEm ? new Date(porta.capturadoEm).toLocaleString() : "Nunca";

    const capturar = async () => {
        setCapturando(true);
        try {
            await api.recon.capturar(projetoId, { alvos: [{ tipo: "porta", id: porta.id }] });
            message.success("Captura enfileirada.");
            refetch();
        } catch {
            message.error("Não foi possível enfileirar a captura.");
        } finally {
            setCapturando(false);
        }
    };

    return (
        <Painel>
            <Cabecalho>
                <div>
                    <h1>{identificacao}</h1>
                    <p>Detalhes da porta descoberta</p>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
                    <Button type="primary" icon={<PictureOutlined />} loading={capturando} onClick={capturar}>
                        Capturar print
                    </Button>
                </Space>
            </Cabecalho>

            <Cartao>
                <Titulo>Resumo</Titulo>
                <Grade>
                    <Item>
                        <strong>Serviço</strong>
                        <Selo>{servico}</Selo>
                    </Item>
                    <Item>
                        <strong>Versão</strong>
                        <span>{versao}</span>
                    </Item>
                    <Item>
                        <strong>IP</strong>
                        <span>{alvo}</span>
                    </Item>
                    <Item>
                        <strong>Última captura</strong>
                        <span>{capturadoEm}</span>
                    </Item>
                </Grade>
            </Cartao>

            <Cartao>
                <Titulo>Captura</Titulo>
                <Figura>
                    {porta.captura ? (
                        <Image src={porta.captura} alt="Captura da porta" style={{ maxHeight: 320 }} />
                    ) : (
                        <Selo>Sem captura</Selo>
                    )}
                </Figura>
            </Cartao>

            <Cartao>
                <Titulo>Tecnologias Detectadas</Titulo>
                <ListaTecnologias resultados={porta.whatwebResultados} />
            </Cartao>
        </Painel>
    );
};

export default VisualizarPorta;
