import useApi from '@/api';
import { Button } from '@/common/components';
import Modal from '@/common/components/Modal';
import StoreContext from '@/store';
import { PlusOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';
import { useContext, useState } from 'react';

const NovoIp = () => {
    const [open, setOpen] = useState(false);
    const [endereco, setEndereco] = useState('');
    const { projeto } = useContext(StoreContext);
    const api = useApi();
    const { mutate: createIp } = api.ips.postIp;

    const handleAdicionar = async () => {
        const projetoId = projeto?.get()?.id;
        if (endereco && projetoId) {
            createIp({ endereco, projetoId }, {
                onSuccess: () => {
                    setEndereco('');
                    setOpen(false);
                }
            });
        }
    };

    return <>
        <Button type='tertiary' format='circle' onClick={() => setOpen(true)}><PlusOutlined /></Button>
        <Modal isOpen={open} onClose={() => setOpen(false)}>
            <Form.Item label="Endereço IP" layout='vertical' required={true}>
                <Input placeholder='127.0.0.1' value={endereco} onChange={(e) => setEndereco(e.target.value)} />
            </Form.Item>
            <hr />
            <Button type='primary' darkMode={true} onClick={handleAdicionar}>Adicionar</Button>
        </Modal>
    </>
}

export default NovoIp;
