import useApi from "@/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEdit, faPlus, faSpiral } from '@fortawesome/free-solid-svg-icons';
import { Menu, Modal } from "@/common/components";
import { useContext, useState } from "react";
import StoreContext from "@/store";
import ProjetoForm from "./ProjetoForm";
import { ProjetoRequest } from "@/types/ProjetoRequest";

const SelecaoProjetos = () => {
    const api = useApi();
    const { data, isLoading, refetch } = api.projeto.getProjetos();
    const { mutate: postProjeto } = api.projeto.postProjeto();
    const { mutate: putProjeto } = api.projeto.putProjeto();
    const { projeto } = useContext(StoreContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (data: ProjetoRequest) => {
        if (isEditing) {
            putProjeto({ ...projeto.get(), ...data }, {
                onSuccess: () => {
                    refetch();
                    setIsModalOpen(false);
                }
            });
        } else {
            postProjeto(data, {
                onSuccess: (newProjeto) => {
                    refetch();
                    projeto.set(newProjeto);
                    setIsModalOpen(false);
                }
            });
        }
    };

    return <>
        {isLoading && <FontAwesomeIcon icon={faSpiral} spin />}
        {!isLoading && <>
            <Menu>
                <Menu.Button>
                    {projeto?.get()?.nome ?? "Nenhum projeto selecionado"} <FontAwesomeIcon icon={faChevronDown} />
                </Menu.Button>
                <Menu.List>
                    {data?.map(p =>
                        <Menu.Item key={p.id} onClick={() => projeto?.set(p)}>
                            {p.nome}
                        </Menu.Item>
                    )}
                    <Menu.Divider />
                    <Menu.Item onClick={() => { setIsEditing(false); setIsModalOpen(true); }}>
                        <FontAwesomeIcon icon={faPlus} /> Novo Projeto
                    </Menu.Item>
                    {projeto?.get() &&
                        <Menu.Item onClick={() => { setIsEditing(true); setIsModalOpen(true); }}>
                            <FontAwesomeIcon icon={faEdit} /> Editar Projeto
                        </Menu.Item>
                    }
                </Menu.List>
            </Menu>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ProjetoForm
                    projeto={isEditing ? projeto.get() : undefined}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </>}
    </>
}

export default SelecaoProjetos;