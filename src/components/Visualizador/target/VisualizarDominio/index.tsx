"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import styled from 'styled-components';
import { DominioResponse } from "@/types/DominioResponse";
import { IpResponse } from "@/types/IpResponse";

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
    word-break: break-word;
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

const Bandeiras = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const BandeiraItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.hoverBackground};
`;

const BandeiraImagem = styled.img`
  width: 32px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
`;

const BandeiraEmoji = styled.span`
  font-size: 1.5rem;
`;

const BandeiraDescricao = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  span {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  strong {
    font-size: 1rem;
  }
`;

const rotulos: Record<string, string> = {
  endereco: 'Endereço',
  alias: 'Alias',
  registrador: 'Registrador',
  registrante: 'Registrante',
  organizacao: 'Organização',
  email: 'E-mail',
  telefone: 'Telefone',
  pais: 'País',
  estado: 'Estado',
  cidade: 'Cidade',
  dns: 'Servidores DNS',
  datacriacao: 'Data de criação',
  dataatualizacao: 'Data de atualização',
  dataexpiracao: 'Data de expiração',
};

const estadosBrasil: Record<string, string> = {
  AC: 'ACRE',
  AL: 'ALAGOAS',
  AP: 'AMAPA',
  AM: 'AMAZONAS',
  BA: 'BAHIA',
  CE: 'CEARA',
  DF: 'DISTRITO FEDERAL',
  ES: 'ESPIRITO SANTO',
  GO: 'GOIAS',
  MA: 'MARANHAO',
  MT: 'MATO GROSSO',
  MS: 'MATO GROSSO DO SUL',
  MG: 'MINAS GERAIS',
  PA: 'PARA',
  PB: 'PARAIBA',
  PR: 'PARANA',
  PE: 'PERNAMBUCO',
  PI: 'PIAUI',
  RJ: 'RIO DE JANEIRO',
  RN: 'RIO GRANDE DO NORTE',
  RS: 'RIO GRANDE DO SUL',
  RO: 'RONDONIA',
  RR: 'RORAIMA',
  SC: 'SANTA CATARINA',
  SP: 'SAO PAULO',
  SE: 'SERGIPE',
  TO: 'TOCANTINS',
};

const normalizarCampo = (campo: string) => campo.toLowerCase();

const formatarCampo = (campo: string) => rotulos[campo] ?? campo;

const formatarData = (valor: string) => {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString('pt-BR');
};

const formatarValor = (campo: string, valor: string) => campo.startsWith('data') ? formatarData(valor) : valor;

const codigoPais = (valor: string) => {
  const texto = valor.trim();
  if (!texto) return '';
  const maiusculo = texto.toUpperCase();
  if (maiusculo.length === 2) return maiusculo;
  if (maiusculo.includes('BRASIL') || maiusculo.includes('BRAZIL')) return 'BR';
  return '';
};

const normalizarEstado = (valor: string) => {
  const texto = valor.trim().toUpperCase();
  const entrada = Object.entries(estadosBrasil).find(([sigla, nome]) => sigla === texto || nome === texto);
  return entrada ? entrada[0] : '';
};

const emojiPais = (codigo: string) => String.fromCodePoint(...codigo.split('').map((c) => c.charCodeAt(0) + 127397));

const VisualizarDominio = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const api = useApi();
    const idDominio = selecaoTarget?.get()?.id;
    const { data: dominio, isLoading, error } = api.dominios.getDominio(idDominio);

    const informacoes = dominio?.informacoes ?? [];
    const valorCampo = (chave: string) => informacoes.find((info) => normalizarCampo(info.campo) === normalizarCampo(chave))?.valor ?? '';

    const codigo = codigoPais(valorCampo('pais'));
    const estado = codigo === 'BR' ? normalizarEstado(valorCampo('estado')) : '';
    const bandeiraPais = codigo ? `https://flagcdn.com/w40/${codigo.toLowerCase()}.png` : '';
    const bandeiraEstado = estado ? `https://raw.githubusercontent.com/wgenial/br-flags/master/png/${estado.toLowerCase()}.png` : '';
    const emoji = codigo ? emojiPais(codigo) : '';

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
                <CardTitle>Informações de Registro</CardTitle>
                {(bandeiraPais || bandeiraEstado) && <Bandeiras>
                    {bandeiraPais && <BandeiraItem>
                        {emoji ? <BandeiraEmoji>{emoji}</BandeiraEmoji> : <BandeiraImagem src={bandeiraPais} alt="Bandeira do país" />}
                        <BandeiraDescricao>
                            <span>País</span>
                            <strong>{codigo}</strong>
                        </BandeiraDescricao>
                    </BandeiraItem>}
                    {bandeiraEstado && <BandeiraItem>
                        <BandeiraImagem src={bandeiraEstado} alt="Bandeira do estado" />
                        <BandeiraDescricao>
                            <span>Estado</span>
                            <strong>{estado}</strong>
                        </BandeiraDescricao>
                    </BandeiraItem>}
                </Bandeiras>}
                {informacoes.length > 0 ? (
                    <InfoGrid>
                        {informacoes.map((info) => {
                            const chave = normalizarCampo(info.campo);
                            return (
                                <InfoItem key={`${info.campo}-${info.valor}`}>
                                    <strong>{formatarCampo(chave)}</strong>
                                    <span>{formatarValor(chave, info.valor)}</span>
                                </InfoItem>
                            );
                        })}
                    </InfoGrid>
                ) : (
                    <p>Nenhuma informação de registro disponível.</p>
                )}
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
