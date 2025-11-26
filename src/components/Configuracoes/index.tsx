import { useContext, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Alert, Spin, InputNumber, Divider, Row, Col } from 'antd';
import { KeyOutlined, IdcardOutlined, RobotOutlined, DatabaseOutlined } from '@ant-design/icons';
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
