import useApi from "@/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faPaperPlane, faPencil, faSpiral } from '@fortawesome/free-solid-svg-icons';
import { Button, Table } from "@/common/components";
import Modal from "@/common/components/Modal";
import { useContext, useState } from "react";
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { TableActionsProps } from "@/common/components/Table";
import StoreContext from "@/store";

const SelecaoProjetos = () => {
    const api = useApi();
    const { data, error, isLoading } = api.projeto.getProjetos();
    const [open, setOpen] = useState(false);
    const { projeto } = useContext(StoreContext);

    const actions: TableActionsProps<ProjetoResponse> | undefined = [
        { icon: faPaperPlane, action: (r) => { projeto?.set(r); setOpen(false) }, title: "Selecionar" },
        { icon: faPencil, action: () => { }, title: "Editar" }
    ]

    return <>
        {isLoading && <FontAwesomeIcon icon={faSpiral} spin />}
        {!isLoading && <>
            <Button onClick={() => setOpen(true)}><FontAwesomeIcon icon={faGear} /></Button>
            <Modal isOpen={open} onClose={() => { setOpen(false) }}>
                <Table<ProjetoResponse> data={data ?? []} actions={actions}>
                    <Table.Thead column="nome" title="Nome" />
                    <Table.Thead<ProjetoResponse> column="createdAt" title="Criado em" render={(r) => new Date(r.createdAt)?.toLocaleString('pt-BR')} />
                    <Table.Thead<ProjetoResponse> column="updatedAt" title="Atualizado em" render={(r) => new Date(r.updatedAt)?.toLocaleString('pt-BR')} />
                </Table>
                <hr />
                <Button type="secondary">Novo Projeto</Button>
            </Modal>
        </>}
    </>
}

export default SelecaoProjetos;