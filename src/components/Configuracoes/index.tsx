import { useContext, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Alert } from 'antd';
import { KeyOutlined, IdcardOutlined } from '@ant-design/icons';
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

    const showAlert = !configData?.googleConfigurado || !configData?.openaiConfigurado;

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
                    validateStatus={!configData?.openaiConfigurado ? 'error' : ''}
                    help={!configData?.openaiConfigurado ? 'Chave não configurada' : ''}
                >
                    <Input.Password
                        prefix={<KeyOutlined />}
                        placeholder="Não altere para manter a chave existente"
                    />
                </Form.Item>
                <Form.Item
                    name="googleApiKey"
                    label="Google API Key"
                     validateStatus={!configData?.googleConfigurado ? 'error' : ''}
                >
                    <Input.Password
                        prefix={<KeyOutlined />}
                        placeholder="Não altere para manter a chave existente"
                    />
                </Form.Item>
                <Form.Item
                    name="googleSearchEngineId"
                    label="Google Search Engine ID"
                    validateStatus={!configData?.googleConfigurado ? 'error' : ''}
                    help={!configData?.googleConfigurado ? 'Chave ou ID do Google não configurado' : ''}
                >
                    <Input
                        prefix={<IdcardOutlined />}
                        placeholder="Não altere para manter o ID existente"
                    />
                </Form.Item>
                 {error && <Alert message={error} type="error" showIcon />}
            </Form>
        </Modal>
    );
}
