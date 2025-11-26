import useApi from '@/api';
import { Button } from '@/common/components';
import Modal from '@/common/components/Modal';
import StoreContext from '@/store';
import { DominioRequest } from '@/types/DominioRequest';
import { ClusterOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';

const NovoDominio = () => {
    const [open, setOpen] = useState(false);
    const [dominio, setDominio] = useState<DominioRequest>();
    const { projeto } = useContext(StoreContext);
    const api = useApi();

    const projetoSelecionado = useMemo(() => projeto?.get()?.id, [projeto]);

    useEffect(() => {
        setDominio((d) => ({ ...d, projetoId: projetoSelecionado }));
    }, [open, projetoSelecionado]);

    const handleAdicionar = async () => {
        if (dominio) {
            await api.dominios.criarDominio(dominio);
        }
        setOpen(false);
    }

    return <>
        <Button type='tertiary' format='circle' onClick={() => setOpen(true)}><ClusterOutlined /></Button>
        <Modal isOpen={open} onClose={() => setOpen(false)}>
            <Form.Item label="Endereco" layout='vertical' required={true}>
                <Input placeholder='www.exemplo.com' value={dominio?.endereco} onChange={(e) => setDominio({ ...dominio, endereco: e.target.value?.replace(/[^\w\s\.\-]/, '') })} />
            </Form.Item>
            <Form.Item label="Alias" layout='vertical'>
                <Input placeholder='Site principal' value={dominio?.alias ?? ''} onChange={(e) => setDominio({ ...dominio, alias: e.target.value })} />
            </Form.Item>
            <hr />
            <Button type='primary' darkMode={true} onClick={handleAdicionar}>Adicionar</Button>
        </Modal>
    </>
}

export default NovoDominio;
