"use client";
import useApi from "@/api";
import StoreContext from "@/store";
import { useContext } from "react";
import styled from 'styled-components';
import { Tabs, Table, Tag, List as AntList, Card as AntCard, Image } from 'antd';
import { IpResponse } from "@/types/IpResponse";

const DashboardContainer = styled.div`
  padding: 1rem;
  background-color: #f4f7f9;
`;

const Header = styled.div`
  margin-bottom: 1rem;
  h1 {
    font-size: 1.8rem;
    font-weight: 500;
    color: #2c3e50;
  }
`;

const TabContent = styled.div`
    padding: 1rem;
    background: #fff;
    border-radius: 0 8px 8px 8px;
`;

const Preformatted = styled.pre`
    white-space: pre-wrap;
    word-wrap: break-word;
    background: #2c3e50;
    color: #f1f1f1;
    padding: 1rem;
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
`;

const columnsPortas = [
    { title: 'Porta', dataIndex: 'numero', key: 'numero' },
    { title: 'Protocolo', dataIndex: 'protocolo', key: 'protocolo' },
    { title: 'Serviço', dataIndex: 'servico', key: 'servico' },
    { title: 'Versão', dataIndex: 'versao', key: 'versao' },
];

const VisualizarIp = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const api = useApi();
    const idIp = selecaoTarget?.get()?.id;
    const { data: ip, isLoading, error, refetch } = api.ips.getIp(idIp, {
        refetchInterval: 5000, // Refetch data every 5 seconds
    });

    if (isLoading) return <DashboardContainer><h2>Carregando...</h2></DashboardContainer>;
    if (error) return <DashboardContainer><h2>Erro ao carregar dados do IP.</h2></DashboardContainer>;
    if (!ip) return <DashboardContainer><h2>Nenhum IP selecionado.</h2></DashboardContainer>;

    const items = [
        {
            key: '1',
            label: 'Visão Geral',
            children: (
                <TabContent>
                    <AntCard title="Domínios Associados">
                        <AntList
                            dataSource={ip.dominios}
                            renderItem={(item: any) => <AntList.Item>{item.endereco}</AntList.Item>}
                        />
                    </AntCard>
                    <AntCard title="Redes Associadas" style={{ marginTop: '1rem' }}>
                        <AntList
                            dataSource={ip.redes}
                            renderItem={(item: any) => <AntList.Item>{item.cidr}</AntList.Item>}
                        />
                    </AntCard>
                </TabContent>
            ),
        },
        {
            key: '2',
            label: `Portas (${ip.portas?.length || 0})`,
            children: <TabContent><Table dataSource={ip.portas} columns={columnsPortas} rowKey="id" /></TabContent>,
        },
        {
            key: '3',
            label: 'Whois',
            children: <TabContent><Preformatted>{ip.whoisInfos?.[0]?.rawOutput || 'Nenhum dado do Whois.'}</Preformatted></TabContent>,
        },
        {
            key: '4',
            label: 'Enumeração Web',
            children: (
                <TabContent>
                    <AntCard title="WhatWeb">
                        <Preformatted>{ip.whatWebResults?.map(r => r.rawOutput).join('\n---\n') || 'Nenhum dado do WhatWeb.'}</Preformatted>
                    </AntCard>
                    <AntCard title="Nikto" style={{ marginTop: '1rem' }}>
                        <Preformatted>{ip.niktoScans?.map(r => r.rawOutput).join('\n---\n') || 'Nenhum dado do Nikto.'}</Preformatted>
                    </AntCard>
                    <AntCard title="Feroxbuster" style={{ marginTop: '1rem' }}>
                        <Preformatted>{ip.feroxbusterScans?.map(r => r.rawOutput).join('\n---\n') || 'Nenhum dado do Feroxbuster.'}</Preformatted>
                    </AntCard>
                </TabContent>
            ),
        },
        {
            key: '5',
            label: `Vulnerabilidades (${ip.nucleiScans?.length || 0})`,
            children: <TabContent><Preformatted>{ip.nucleiScans?.map(r => r.rawOutput).join('\n') || 'Nenhuma vulnerabilidade encontrada pelo Nuclei.'}</Preformatted></TabContent>,
        },
        {
            key: '6',
            label: 'SSL/TLS',
            children: <TabContent><Preformatted>{ip.testsslScans?.map(r => r.rawOutput).join('\n---\n') || 'Nenhum dado do Testssl.sh.'}</Preformatted></TabContent>,
        },
        {
            key: '7',
            label: 'Enumeração SMB',
            children: <TabContent><Preformatted>{ip.enum4linuxScans?.[0]?.rawOutput || 'Nenhum dado do Enum4linux-ng.'}</Preformatted></TabContent>,
        },
        {
            key: '8',
            label: `Screenshots (${ip.webScreenshots?.length || 0})`,
            children: (
                <TabContent>
                    <Image.PreviewGroup>
                        {ip.webScreenshots?.map(ss => <Image key={ss.id} width={200} src={ss.path} />)}
                    </Image.PreviewGroup>
                </TabContent>
            ),
        },
        {
            key: '9',
            label: 'DNS',
            children: <TabContent><Preformatted>{ip.dnsreconScans?.[0]?.rawOutput || 'Nenhum dado do Dnsrecon.'}</Preformatted></TabContent>,
        },
        {
            key: '10',
            label: 'Nmap (Raw)',
            children: <TabContent><Preformatted>{ip.nmapScans?.[0]?.rawOutput || 'Nenhum dado do Nmap.'}</Preformatted></TabContent>,
        },
    ];

    return (
        <DashboardContainer>
            <Header>
                <h1>{ip.endereco}</h1>
            </Header>
            <Tabs defaultActiveKey="1" items={items.filter(item => {
                switch (item.key) {
                    case '2': return ip.portas && ip.portas.length > 0;
                    case '3': return ip.whoisInfos && ip.whoisInfos.length > 0;
                    case '4': return (ip.whatWebResults && ip.whatWebResults.length > 0) || (ip.niktoScans && ip.niktoScans.length > 0) || (ip.feroxbusterScans && ip.feroxbusterScans.length > 0);
                    case '5': return ip.nucleiScans && ip.nucleiScans.length > 0;
                    case '6': return ip.testsslScans && ip.testsslScans.length > 0;
                    case '7': return ip.enum4linuxScans && ip.enum4linuxScans.length > 0;
                    case '8': return ip.webScreenshots && ip.webScreenshots.length > 0;
                    case '9': return ip.dnsreconScans && ip.dnsreconScans.length > 0;
                    case '10': return ip.nmapScans && ip.nmapScans.length > 0;
                    default: return true;
                }
            })} />
        </DashboardContainer>
    );
}

export default VisualizarIp;
