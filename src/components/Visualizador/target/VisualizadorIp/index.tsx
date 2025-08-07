"use client";
import { useContext, useEffect, useState } from 'react';
import { Tabs, Table, Tag, Typography, List, Card, Spin } from 'antd';
import StoreContext from '@/store';
import useApi from '@/api';
import { StyledVisualizadorIp } from './styles';
import { ColumnsType } from 'antd/es/table';
import { Exploit, Porta, SMBShare, SSLCipher, TracerouteHop, Vulnerabilidade, WebAppPath, WhoisInfo } from '@prisma/client';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

// This will be our full IP details type
type IpDetails = {
    id: number;
    endereco: string;
    reverseDns: string | null;
    portas: Porta[];
    vulnerabilidades: (Vulnerabilidade & { porta: Porta })[];
    whois: WhoisInfo[];
    traceroutes: TracerouteHop[];
    smbShares: SMBShare[];
    sslCiphers: (SSLCipher & { porta: Porta })[];
    webAppPaths: (WebAppPath & { porta: Porta })[];
    exploits: (Exploit & { porta: Porta })[];
};

const VisualizadorIp = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const [ipDetails, setIpDetails] = useState<IpDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const api = useApi();
    const target = selecaoTarget?.get();

    useEffect(() => {
        const fetchDetails = async () => {
            if (target && target.tipo === 'ip') {
                setLoading(true);
                try {
                    // We will create this API endpoint later
                    const details = await api.ips.getIpDetails(target.id);
                    setIpDetails(details);
                } catch (error) {
                    console.error("Failed to fetch IP details:", error);
                    setIpDetails(null);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDetails();
    }, [target, api.ips]);

    if (loading) {
        return <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />;
    }

    if (!ipDetails) {
        return <Text>Selecione um alvo de IP para ver os detalhes.</Text>;
    }

    const portaColumns: ColumnsType<Porta> = [
        { title: 'Porta', dataIndex: 'numero', key: 'numero', render: (text, record) => `${text}/${record.protocolo}` },
        { title: 'Status', dataIndex: 'status', key: 'status', render: status => <Tag color={status === 'open' ? 'green' : 'red'}>{status}</Tag> },
        { title: 'Serviço', dataIndex: 'servico', key: 'servico' },
        { title: 'Versão', dataIndex: 'versao', key: 'versao' },
    ];

    return (
        <StyledVisualizadorIp>
            <Title level={4}>Detalhes do IP: {ipDetails.endereco}</Title>
            {ipDetails.reverseDns && <Text strong>DNS Reverso: {ipDetails.reverseDns}</Text>}
            <Tabs defaultActiveKey="1">
                <TabPane tab="Portas e Serviços" key="1">
                    <Table columns={portaColumns} dataSource={ipDetails.portas} rowKey="id" size="small" />
                </TabPane>
                <TabPane tab={`Vulnerabilidades (${ipDetails.vulnerabilidades.length})`} key="2">
                    <List
                        itemLayout="vertical"
                        dataSource={ipDetails.vulnerabilidades}
                        renderItem={item => (
                            <List.Item key={item.id}>
                                <List.Item.Meta
                                    title={`${item.titulo} (Porta ${item.porta.numero})`}
                                    description={<Text type="danger">{item.severidade}</Text>}
                                />
                                <pre>{item.descricao}</pre>
                                {item.referencias && <pre>Referências:\n{item.referencias}</pre>}
                            </List.Item>
                        )}
                    />
                </TabPane>
                 <TabPane tab={`Descobertas Web (${ipDetails.webAppPaths.length})`} key="3">
                    <List
                        dataSource={ipDetails.webAppPaths}
                        renderItem={item => (
                             <List.Item key={item.id}>
                                <Text code>{item.path}</Text> (Status: {item.statusCode}) na porta {item.porta.numero}
                            </List.Item>
                        )}
                    />
                </TabPane>
                <TabPane tab={`Exploits (${ipDetails.exploits.length})`} key="4">
                     <List
                        dataSource={ipDetails.exploits}
                        renderItem={item => (
                             <List.Item key={item.id}>
                                <a href={`https://www.exploit-db.com/exploits/${item.edbId}`} target="_blank" rel="noopener noreferrer">{item.description}</a>
                                <br/>
                                <Text type="secondary">Caminho: {item.path} (Associado à porta {item.porta.numero})</Text>
                            </List.Item>
                        )}
                    />
                </TabPane>
                <TabPane tab="Whois" key="5">
                    <pre>{ipDetails.whois[0]?.rawText ?? 'Nenhuma informação Whois encontrada.'}</pre>
                </TabPane>
                 <TabPane tab={`Cifras SSL (${ipDetails.sslCiphers.length})`} key="6">
                    <List
                        dataSource={ipDetails.sslCiphers}
                        renderItem={item => (
                             <List.Item key={item.id}>
                                {item.protocol} - {item.bits} bits - {item.name} (na porta {item.porta.numero})
                            </List.Item>
                        )}
                    />
                </TabPane>
                <TabPane tab={`Compartilhamentos SMB (${ipDetails.smbShares.length})`} key="7">
                     <List
                        dataSource={ipDetails.smbShares}
                        renderItem={item => (
                             <List.Item key={item.id}>
                                <Text strong>{item.name}</Text> - {item.comment}
                            </List.Item>
                        )}
                    />
                </TabPane>
                <TabPane tab="Traceroute" key="8">
                     <List
                        dataSource={ipDetails.traceroutes.sort((a, b) => a.hop - b.hop)}
                        renderItem={item => (
                             <List.Item key={item.id}>
                                {item.hop}. <Text code>{item.ipAddress}</Text> ({item.rtt1 ?? 'N/A'} ms)
                            </List.Item>
                        )}
                    />
                </TabPane>
            </Tabs>
        </StyledVisualizadorIp>
    );
};

export default VisualizadorIp;
