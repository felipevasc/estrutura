import { Button } from "@/common/components";
import { ProjetoRequest } from "@/types/ProjetoRequest";
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { useForm } from "react-hook-form";
import { FormContainer } from "./ProjetoForm.styles";

type ProjetoFormProps = {
    projeto?: ProjetoResponse;
    onSave: (data: ProjetoRequest) => void;
    onCancel: () => void;
};

const ProjetoForm = ({ projeto, onSave, onCancel }: ProjetoFormProps) => {
    const { register, handleSubmit } = useForm<ProjetoRequest>({
        defaultValues: projeto,
    });

    return (
        <FormContainer>
            <div className="field">
                <label htmlFor="nome">Nome do Projeto</label>
                <input type="text" {...register("nome", { required: true })} />
            </div>
            <div className="actions">
                <Button onClick={handleSubmit(onSave)} type="primary" >Salvar</Button>
                <Button type="secondary" onClick={onCancel}>Cancelar</Button>
            </div>
        </FormContainer>
    );
};

export default ProjetoForm;
