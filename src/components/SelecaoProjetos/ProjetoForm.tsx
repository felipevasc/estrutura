import { Button } from "@/common/components";
import { ProjetoRequest } from "@/types/ProjetoRequest";
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { useForm } from "react-hook-form";

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
        <form onSubmit={handleSubmit(onSave)}>
            <div className="field">
                <label htmlFor="nome">Nome do Projeto</label>
                <input type="text" {...register("nome", { required: true })} />
            </div>
            <div className="actions">
                <Button type="submit" >Salvar</Button>
                <Button type="button" onClick={onCancel}>Cancelar</Button>
            </div>
        </form>
    );
};

export default ProjetoForm;
