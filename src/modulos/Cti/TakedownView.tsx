
'use client';

import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Tag, Modal, Form, Input, DatePicker, Select, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { useTakedownApi, Takedown } from '@/api/cti/takedown';
import dayjs from 'dayjs';

const TakedownContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TakedownView = () => {
    const { projeto } = useStore();
    const {
        takedowns,
        solicitantes,
        isLoading,
        createTakedown,
        updateTakedown,
        deleteTakedown,
        checkTakedownStatus
    } = useTakedownApi(projeto?.id);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTakedown, setEditingTakedown] = useState<Takedown | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingTakedown) {
            form.setFieldsValue({
                ...editingTakedown,
                solicitadoEm: editingTakedown.solicitadoEm ? dayjs(editingTakedown.solicitadoEm) : null,
                previsao: editingTakedown.previsao ? dayjs(editingTakedown.previsao) : null,
                derrubadoEm: editingTakedown.derrubadoEm ? dayjs(editingTakedown.derrubadoEm) : null,
                solicitantes: editingTakedown.solicitantes.map(s => s.nome),
            });
        } else {
            form.resetFields();
        }
    }, [editingTakedown, form]);

    const handleAdd = () => {
        setEditingTakedown(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record: Takedown) => {
        setEditingTakedown(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Você tem certeza que deseja deletar este item?',
            onOk: async () => {
                await deleteTakedown(id);
            },
        });
    };

    const handleCheckStatus = async (ids: number[]) => {
        if (!projeto || ids.length === 0) return;
        await checkTakedownStatus(ids);
        setSelectedRowKeys([]);
    };

    const handleModalOk = async () => {
        if (!projeto?.id) {
            message.error('Por favor, selecione um projeto antes de adicionar um takedown.');
            return;
        }

        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                projetoId: projeto.id,
            };

            if (editingTakedown) {
                await updateTakedown({ ...payload, id: editingTakedown.id });
            } else {
                await createTakedown(payload);
            }
            setIsModalVisible(false);
        } catch (error) {
            message.error('Falha ao salvar. Verifique os campos.');
        }
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = { selectedRowKeys, onChange: onSelectChange };
    const hasSelected = selectedRowKeys.length > 0;

    const columns = [
        { title: 'URL', dataIndex: 'url', key: 'url', sorter: (a: Takedown, b: Takedown) => a.url.localeCompare(b.url) },
        { title: 'Solicitado Para', dataIndex: 'solicitantes', key: 'solicitantes', render: (sol: {nome: string}[]) => sol.map(s => <Tag key={s.nome}>{s.nome}</Tag>) },
        { title: 'Solicitado Em', dataIndex: 'solicitadoEm', key: 'solicitadoEm', render: (text: string) => new Date(text).toLocaleDateString(), sorter: (a: Takedown, b: Takedown) => new Date(a.solicitadoEm).getTime() - new Date(b.solicitadoEm).getTime() },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'DERRUBADO' ? 'green' : 'blue'}>{status}</Tag> },
        { title: 'Status Verificação', key: 'statusVerificacao', render: (_:any, r: Takedown) => r.statusUltimaVerificacao ? <Tag color={r.statusUltimaVerificacao === 'ONLINE' ? 'red' : 'green'}>{r.statusUltimaVerificacao} @ {new Date(r.ultimaVerificacao!).toLocaleTimeString()}</Tag> : '-' },
        {
            title: 'Ações',
            key: 'action',
            render: (_: any, record: Takedown) => (
                <Space size="middle">
                    <Button icon={<SyncOutlined />} onClick={() => handleCheckStatus([record.id])} />
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger />
                </Space>
            ),
        },
    ];

    return (
        <TakedownContainer>
            <Header>
                <div>
                    <Button
                        type="primary"
                        onClick={handleAdd}
                        icon={<PlusOutlined />}
                        disabled={!projeto?.id}
                    >
                        Adicionar Takedown
                    </Button>
                    <Button
                        onClick={() => handleCheckStatus(selectedRowKeys as number[])}
                        disabled={!hasSelected || !projeto?.id}
                        style={{ marginLeft: 8 }}
                    >
                        Verificar Selecionados
                    </Button>
                </div>
                <span style={{ marginLeft: 8 }}>{hasSelected ? `${selectedRowKeys.length} itens selecionados` : ''}</span>
            </Header>
            <Table
                rowKey="id"
                rowSelection={rowSelection}
                columns={columns}
                dataSource={takedowns}
                loading={isLoading}
                style={{ height: '100%', overflowY: 'auto' }}
            />
            <Modal
                title={editingTakedown ? 'Editar Takedown' : 'Adicionar Takedown'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                width={800}
                destroyOnClose
            >
                <Form form={form} layout="vertical" name="takedown_form">
                    <Form.Item name="url" label="URL" rules={[{ required: true, message: 'Por favor, insira a URL' }]}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="solicitadoEm" label="Solicitado Em"><DatePicker format="DD/MM/YYYY" style={{width: '100%'}} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="previsao" label="Previsão"><DatePicker format="DD/MM/YYYY" style={{width: '100%'}} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="derrubadoEm" label="Derrubado Em"><DatePicker format="DD/MM/YYYY" style={{width: '100%'}} /></Form.Item></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="status" label="Status">
                                <Select options={[{value: 'SOLICITADO', label: 'Solicitado'}, {value: 'DERRUBADO', label: 'Derrubado'}]} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item
                                name="solicitantes"
                                label="Solicitado Para"
                                rules={[{ required: true, message: 'Por favor, informe para quem foi solicitado' }]}
                             >
                                <Select mode="tags" options={solicitantes.map(s => ({label: s.nome, value: s.nome}))} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <h4>Configuração da Verificação (Opcional)</h4>
                    <Row gutter={16}>
                         <Col span={8}><Form.Item name="metodoHttp" label="Método HTTP"><Input /></Form.Item></Col>
                    </Row>
                    <Form.Item name="headers" label="Headers (JSON)"><Input.TextArea rows={4} /></Form.Item>
                    <Form.Item name="body" label="Body"><Input.TextArea rows={4} /></Form.Item>
                </Form>
            </Modal>
        </TakedownContainer>
    );
};

export default TakedownView;
