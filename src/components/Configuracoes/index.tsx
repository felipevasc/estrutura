import { useContext, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Alert, Spin, InputNumber, Divider, Row, Col } from 'antd';
import { KeyOutlined, IdcardOutlined, RobotOutlined, DatabaseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import StoreContext from '@/store';
import useApi from '@/api';
import { StoreType } from '@/store/types/StoreType';

export default function Configuracoes() {
    const { isConfiguracoesOpen, configuracoes } = useContext<StoreType>(StoreContext);
    const api = useApi();
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const open = isConfiguracoesOpen?.get();
    const configData = configuracoes?.get();

    useEffect(() => {
        if (open && configData) {
            form.setFieldsValue(configData);
        }
    }, [open, configData, form]);

    useEffect(() => {
        if (!open) {
            form.resetFields();
            setError('');
        }
    }, [open, form]);

    const handleSave = async (values: any) => {
        setLoading(true);
        setError('');
        try {
            await api.configuracoes.saveConfig(values);
            isConfiguracoesOpen?.set(false);
            const newConfig = await api.configuracoes.getConfig();
            configuracoes?.set(newConfig);
        } catch (err) {
            setError('Falha ao salvar. Verifique o console para mais detalhes.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        isConfiguracoesOpen?.set(false);
    };

    const showAlert = !configData?.openaiApiKey || !configData?.googleApiKey || !configData?.googleSearchEngineId;

    const abrirAjudaApiTelegram = () => {
        Modal.info({
            title: 'Como obter API ID e API Hash do Telegram',
            content: (
                <div>
                    <p>Use as credenciais oficiais do Telegram para operar via número.</p>
                    <ol>
                        <li>Acesse my.telegram.org e faça login com o número que já está nos grupos.</li>
                        <li>Escolha API Development e gere um novo app.</li>
                        <li>Copie o API ID e o API Hash exibidos após a criação.</li>
                        <li>Insira os valores nos campos abaixo para autenticar as coletas.</li>
                    </ol>
                </div>
            ),
            okText: 'Entendi',
        });
    };

    const abrirAjudaNumeroTelegram = () => {
        Modal.info({
            title: 'Como configurar o número do Telegram',
            content: (
                <div>
                    <p>Informe o mesmo número que já participa dos grupos/canais de coleta.</p>
                    <ol>
                        <li>Digite o número completo no campo Número do Telegram.</li>
                        <li>Preencha o Código do País incluindo o sinal de mais, por exemplo +55.</li>
                        <li>Certifique-se de que o número possui acesso aos grupos desejados.</li>
                    </ol>
                </div>
            ),
            okText: 'Entendi',
        });
    };

    const abrirAjudaSessaoTelegram = () => {
        Modal.info({
            title: 'Senha ou token de sessão do Telegram',
            content: (
                <div>
                    <p>Escolha o modo de autenticação direta pelo número.</p>
                    <ol>
                        <li>Se a conta tiver senha em duas etapas, informe a senha no campo.</li>
                        <li>Se preferir token de sessão, gere-o com uma biblioteca MTProto como Telethon e cole o valor aqui.</li>
                        <li>Mantenha o token seguro; ele substitui o uso do bot para evitar remoções dos grupos.</li>
                    </ol>
                </div>
            ),
            okText: 'Entendi',
        });
    };

    const rotuloComAjuda = (texto: string, onClick: () => void) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{texto}</span>
            <Button type="link" size="small" icon={<InfoCircleOutlined />} onClick={onClick} />
        </div>
    );

    return (
        <Modal
            title="Configurações"
            open={open}
            onCancel={handleCancel}
            width={600}
            destroyOnHidden
            footer={[
                <Button key="back" onClick={handleCancel} disabled={loading}>
                    Cancelar
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
                    Salvar
                </Button>,
            ]}
        >
            {!configData ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={configData}
                >
                    {showAlert && (
                        <Alert
                            message="Configuração Necessária"
                            description="Uma ou mais chaves de API não estão configuradas. Por favor, preencha os campos destacados."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    )}
                    <Divider orientation="left">APIs</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="openaiApiKey"
                                label="OpenAI API Key"
                                validateStatus={!configData?.openaiApiKey ? 'error' : ''}
                                help={!configData?.openaiApiKey ? 'Chave não configurada' : ''}
                            >
                                <Input.Password
                                    prefix={<KeyOutlined />}
                                    placeholder="Deixe em branco para não alterar"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="openaiApiModel"
                                label="Modelo OpenAI (ex: gpt-4-turbo)"
                            >
                                <Input
                                    prefix={<RobotOutlined />}
                                    placeholder="gpt-4-turbo"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="googleApiKey"
                                label="Google API Key"
                                validateStatus={!configData?.googleApiKey ? 'error' : ''}
                            >
                                <Input.Password
                                    prefix={<KeyOutlined />}
                                    placeholder="Deixe em branco para não alterar"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="googleSearchEngineId"
                                label="Google Search Engine ID"
                                validateStatus={!configData?.googleSearchEngineId ? 'error' : ''}
                                help={!configData?.googleApiKey || !configData?.googleSearchEngineId ? 'Chave ou ID do Google não configurado' : ''}
                            >
                                <Input
                                    prefix={<IdcardOutlined />}
                                    placeholder="Deixe em branco para não alterar"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Telegram</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="telegramApiId" label={rotuloComAjuda('Telegram API ID', abrirAjudaApiTelegram)}>
                                <Input prefix={<IdcardOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="telegramApiHash" label={rotuloComAjuda('Telegram API Hash', abrirAjudaApiTelegram)}>
                                <Input.Password prefix={<KeyOutlined />} placeholder="Deixe em branco para não alterar" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="telegramNumero" label={rotuloComAjuda('Número do Telegram', abrirAjudaNumeroTelegram)}>
                                <Input prefix={<IdcardOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="telegramCodigoPais" label={rotuloComAjuda('Código do País', abrirAjudaNumeroTelegram)}>
                                <Input prefix={<IdcardOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="telegramSenha" label={rotuloComAjuda('Senha ou token de sessão', abrirAjudaSessaoTelegram)}>
                                <Input.Password prefix={<KeyOutlined />} placeholder="Deixe em branco para não alterar" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Limites de Contexto da IA</Divider>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="contextLimitDominio" label="Domínios">
                                <InputNumber prefix={<DatabaseOutlined />} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="contextLimitIp" label="IPs">
                                <InputNumber prefix={<DatabaseOutlined />} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="contextLimitPorta" label="Portas">
                                <InputNumber prefix={<DatabaseOutlined />} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="contextLimitDiretorio" label="Diretórios">
                                <InputNumber prefix={<DatabaseOutlined />} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="contextLimitUsuario" label="Usuários">
                                <InputNumber prefix={<DatabaseOutlined />} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="contextLimitDeface" label="Deface">
                                <InputNumber prefix={<DatabaseOutlined />} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">CTI</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="takedownDiasPrevisao" label="Dias de Previsão para Takedown">
                                <InputNumber addonAfter="dias" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {error && <Alert message={error} type="error" showIcon style={{marginTop: '16px'}}/>}
                </Form>
            )}
        </Modal>
    );
}
