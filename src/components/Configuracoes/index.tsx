import { useContext, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Alert } from 'antd';
import { KeyOutlined, IdcardOutlined, RobotOutlined } from '@ant-design/icons';
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
        if (!open) {
            form.resetFields();
            setError('');
        }
    }, [open, configData, form]);

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
            footer={[
                <Button key="back" onClick={handleCancel} disabled={loading}>
                    Cancelar
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
                    Salvar
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleSave}>
                {showAlert && (
                    <Alert
                        message="Configuração Necessária"
                        description="Uma ou mais chaves de API não estão configuradas. Por favor, preencha os campos destacados."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}
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
                 <Form.Item
                    name="openaiApiModel"
                    label="Modelo OpenAI (ex: gpt-4-turbo)"
                >
                    <Input
                        prefix={<RobotOutlined />}
                        placeholder="gpt-4-turbo"
                    />
                </Form.Item>
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
                 {error && <Alert message={error} type="error" showIcon />}
            </Form>
        </Modal>
    );
}
