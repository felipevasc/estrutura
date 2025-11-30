import useApi from "@/api";
import { List, Spin, Descriptions, Empty, Typography } from "antd";
import { InspectorBody } from "./styles";
import { WhatwebResultadoResponse } from "@/types/WhatwebResultadoResponse";

const { Text } = Typography;

type AlvoSelecionado = {
    id: string | number;
    tipo: string;
};

type PropsDetalhes = {
    alvo: AlvoSelecionado | null;
};

const InspectorDetalhes = ({ alvo }: PropsDetalhes) => {
    const { dominios, ips, diretorios } = useApi();
    const id = alvo && alvo.id ? Number(alvo.id) : undefined;

    // Correct usage of API hooks
    const queryDominio = dominios.getDominio(id);
    const queryIp = ips.getIp(id);
    const queryDiretorio = diretorios.useDiretorio(id);

    let dados: any = null;
    let carregando = false;
    let whatwebResultados: WhatwebResultadoResponse[] = [];

    // Determine which data to use based on alvo.tipo
    if (alvo?.tipo === "domain" && id) {
        dados = queryDominio.data;
        carregando = queryDominio.isLoading;
        whatwebResultados = dados?.whatwebResultados || [];
    } else if (alvo?.tipo === "ip" && id) {
        dados = queryIp.data;
        carregando = queryIp.isLoading;
        whatwebResultados = dados?.whatwebResultados || [];
    } else if (alvo?.tipo === "diretorio" && id) {
        dados = queryDiretorio.data;
        carregando = queryDiretorio.isLoading;
        whatwebResultados = dados?.whatwebResultados || [];
    }

    if (!alvo) {
        return (
            <InspectorBody>
                <Empty description="Selecione um item para ver detalhes" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </InspectorBody>
        );
    }

    if (carregando) {
        return (
            <InspectorBody>
                <Spin tip="Carregando detalhes..." />
            </InspectorBody>
        );
    }

    if (!dados) {
        return (
            <InspectorBody>
                <Empty description="Detalhes não encontrados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </InspectorBody>
        );
    }

    return (
        <InspectorBody>
             <Descriptions title="Informações Básicas" column={1} layout="vertical" bordered size="small">
                {alvo.tipo === 'domain' && (
                    <>
                        <Descriptions.Item label="Domínio">{dados.endereco}</Descriptions.Item>
                        <Descriptions.Item label="Alias">{dados.alias || '-'}</Descriptions.Item>
                    </>
                )}
                {alvo.tipo === 'ip' && (
                    <>
                         <Descriptions.Item label="Endereço IP">{dados.endereco}</Descriptions.Item>
                    </>
                )}
                 {alvo.tipo === 'diretorio' && (
                    <>
                         <Descriptions.Item label="Caminho">{dados.caminho}</Descriptions.Item>
                         <Descriptions.Item label="Status">{dados.status}</Descriptions.Item>
                         <Descriptions.Item label="Tamanho">{dados.tamanho}</Descriptions.Item>
                    </>
                )}
            </Descriptions>

            <div style={{ marginTop: 20 }}>
                <Text strong>Tecnologias (WhatWeb)</Text>
                {whatwebResultados.length > 0 ? (
                    <List
                        size="small"
                        dataSource={whatwebResultados}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={item.plugin}
                                    description={
                                        <Text code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                            {item.valor}
                                        </Text>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description="Nenhuma tecnologia detectada" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 10 }} />
                )}
            </div>
        </InspectorBody>
    );
};

export default InspectorDetalhes;
