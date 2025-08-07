import useApi from "@/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEdit, faPlus, faSpiral } from '@fortawesome/free-solid-svg-icons';
import Modal from "@/common/components/Modal";
import { useContext, useState } from "react";
import StoreContext from "@/store";
import ProjetoForm from "./ProjetoForm";
import { ProjetoRequest } from "@/types/ProjetoRequest";
import { DropdownContainer, DropdownButton, DropdownContent } from "./styles";

const SelecaoProjetos = () => {
    const api = useApi();
    const { data, isLoading, refetch } = api.projeto.getProjetos();
    const { mutate: postProjeto } = api.projeto.postProjeto();
    const { mutate: putProjeto } = api.projeto.putProjeto();
    const { projeto } = useContext(StoreContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSave = (data: ProjetoRequest) => {
        if (isEditing) {
            const currentProjeto = projeto?.get();
            if (currentProjeto) {
                const updatedProjeto: ProjetoResponse = {
                    id: currentProjeto.id,
                    nome: data.nome,
                    createdAt: currentProjeto.createdAt,
                    updatedAt: currentProjeto.updatedAt,
                };
                putProjeto(updatedProjeto, {
                    onSuccess: () => {
                        refetch();
                        setIsModalOpen(false);
                    }
                });
            }
        } else {
            postProjeto(data, {
                onSuccess: (newProjeto) => {
                    refetch();
                    projeto?.set(newProjeto);
                    setIsModalOpen(false);
                }
            });
        }
    };

    return <>
        {isLoading && <FontAwesomeIcon icon={faSpiral} spin />}
        {!isLoading && <>
            <DropdownContainer>
                <DropdownButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    {projeto?.get()?.nome ?? "Nenhum projeto selecionado"} <FontAwesomeIcon icon={faChevronDown} />
                </DropdownButton>
                {isDropdownOpen &&
                    <DropdownContent>
                        {data?.map(p =>
                            <a key={p.id} onClick={() => { projeto?.set(p); setIsDropdownOpen(false); }}>
                                {p.nome}
                            </a>
                        )}
                        <hr />
                        <a onClick={() => { setIsEditing(false); setIsModalOpen(true); setIsDropdownOpen(false); }}>
                            <FontAwesomeIcon icon={faPlus} /> Novo Projeto
                        </a>
                        {projeto?.get() &&
                            <a onClick={() => { setIsEditing(true); setIsModalOpen(true); setIsDropdownOpen(false); }}>
                                <FontAwesomeIcon icon={faEdit} /> Editar Projeto
                            </a>
                        }
                    </DropdownContent>
                }
            </DropdownContainer>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ProjetoForm
                    projeto={isEditing ? projeto?.get() : undefined}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </>}
    </>
}

export default SelecaoProjetos;