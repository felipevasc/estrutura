"use client";
import useApi from "@/api";
import ListaTecnologias from "../ListaTecnologias";
import StoreContext from "@/store";
import { useContext, useState } from "react";
import styled from "styled-components";
import { Button, Image, Modal, Space, message } from "antd";
import { BranchesOutlined, PictureOutlined } from "@ant-design/icons";

const Painel = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  height: 100%;
  overflow-y: auto;
`;

const Cabecalho = styled.div`
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

const Cartao = styled.div`
  background-color: ${({ theme }) => theme.colors.panelBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s, border-color 0.3s;
`;

const Titulo = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.accentColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding-bottom: 0.75rem;
  transition: color 0.3s, border-color 0.3s;
`;

const LinhaTitulo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

const VisualizarDiretorio = () => {
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const api = useApi();
    const idDiretorio = selecaoTarget?.get()?.id;
    const projetoId = projeto?.get()?.id;
    const { data: diretorio, isLoading, error, refetch } = api.diretorios.useDiretorio(idDiretorio);
    const [capturando, setCapturando] = useState(false);
    const [capturandoRecursivo, setCapturandoRecursivo] = useState(false);

    if (isLoading) return <Painel><h2>Carregando...</h2></Painel>;
    if (error) return <Painel><h2>Erro ao carregar dados do diretório.</h2></Painel>;
    if (!diretorio) return <Painel><h2>Nenhum diretório selecionado.</h2></Painel>;

    const alvo = diretorio.dominio?.endereco || diretorio.ip?.endereco || "Alvo desconhecido";
    const tipo = diretorio.tipo === "arquivo" ? "Arquivo" : "Diretório";
    const status = diretorio.status !== null && diretorio.status !== undefined ? diretorio.status : "N/A";
    const tamanho = diretorio.tamanho !== null && diretorio.tamanho !== undefined ? `${diretorio.tamanho}b` : "N/A";
    const criadoEm = diretorio.criadoEm ? new Date(diretorio.criadoEm).toLocaleString() : "N/A";
    const capturadoEm = diretorio.capturadoEm ? new Date(diretorio.capturadoEm).toLocaleString() : "Nunca";

    const capturar = async () => {
        setCapturando(true);
        try {
            await api.recon.capturar(projetoId, { alvos: [{ tipo: "diretorio", id: diretorio.id }] });
            message.success("Captura enfileirada.");
            refetch();
        } catch {
            message.error("Não foi possível enfileirar a captura.");
        } finally {
            setCapturando(false);
        }
    };

    const capturarHierarquia = async () => {
        setCapturandoRecursivo(true);
        try {
            await api.recon.capturar(projetoId, { abrangencia: "diretorios", diretorioId: diretorio.id, dominioId: diretorio.dominio?.id ?? null, ipId: diretorio.ip?.id ?? null });
            message.success("Capturas enfileiradas.");
            refetch();
        } catch {
            message.error("Não foi possível enfileirar capturas.");
        } finally {
            setCapturandoRecursivo(false);
        }
    };

    const confirmarHierarquia = () => {
        Modal.confirm({
            title: "Capturar subdiretórios",
            content: "Deseja capturar prints de todos os subdiretórios deste caminho?",
            okText: "Confirmar",
            cancelText: "Cancelar",
            onOk: capturarHierarquia,
        });
    };

    return (
        <Painel>
            <Cabecalho>
                <h1>{diretorio.caminho}</h1>
                <p>Detalhes do caminho encontrado via fuzzing</p>
            </Cabecalho>

            <Cartao>
                <LinhaTitulo>
                    <Titulo>Captura</Titulo>
                    <Space>
                        <Button icon={<PictureOutlined />} onClick={capturar} loading={capturando}>Capturar</Button>
                        <Button icon={<BranchesOutlined />} onClick={confirmarHierarquia} loading={capturandoRecursivo}>Subdiretórios</Button>
                    </Space>
                </LinhaTitulo>
                <Figura>
                    {diretorio.captura ? <Image src={diretorio.captura} alt="Captura do diretório" style={{ maxHeight: 320 }} /> : <Selo>Sem captura</Selo>}
                </Figura>
                <p style={{ marginTop: 12 }}>Última captura: {capturadoEm}</p>
            </Cartao>

            <Cartao>
                <Titulo>Resumo</Titulo>
                <Grade>
                    <Item>
                        <strong>Tipo</strong>
                        <Selo>{tipo}</Selo>
                    </Item>
                    <Item>
                        <strong>Alvo</strong>
                        <span>{alvo}</span>
                    </Item>
                    <Item>
                        <strong>Status HTTP</strong>
                        <span>{status}</span>
                    </Item>
                    <Item>
                        <strong>Tamanho</strong>
                        <span>{tamanho}</span>
                    </Item>
                    <Item>
                        <strong>Registrado em</strong>
                        <span>{criadoEm}</span>
                    </Item>
                </Grade>
            </Cartao>

            <Cartao>
                <Titulo>Associação</Titulo>
                <Grade>
                    <Item>
                        <strong>Domínio</strong>
                        <span>{diretorio.dominio?.endereco || "N/A"}</span>
                    </Item>
                    <Item>
                        <strong>IP</strong>
                        <span>{diretorio.ip?.endereco || "N/A"}</span>
                    </Item>
                </Grade>
            </Cartao>

            <Cartao>
                <Titulo>Tecnologias Detectadas</Titulo>
                <ListaTecnologias resultados={diretorio.whatwebResultados} />
            </Cartao>
        </Painel>
    );
};

export default VisualizarDiretorio;
