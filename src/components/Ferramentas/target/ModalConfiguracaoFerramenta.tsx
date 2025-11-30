import { useEffect, useState } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Divider, Input, InputNumber, Modal, Switch } from "antd";

type TipoCampo = "texto" | "numero" | "booleano";

type CampoConfiguracao = {
    chave: string;
    rotulo: string;
    tipo: TipoCampo;
    detalhe: string;
    descricao?: string;
};

type Props = {
    aberto: boolean;
    titulo: string;
    descricao?: string;
    campos: CampoConfiguracao[];
    valores: Record<string, unknown>;
    aoAlterar: (chave: string, valor: unknown) => void;
    aoConfirmar: () => void;
    aoCancelar: () => void;
};

const ModalConfiguracaoFerramenta = ({ aberto, titulo, descricao, campos, valores, aoAlterar, aoConfirmar, aoCancelar }: Props) => {
    const [campoDetalhado, definirCampoDetalhado] = useState<CampoConfiguracao | null>(null);

    useEffect(() => {
        if (!aberto) definirCampoDetalhado(null);
    }, [aberto]);
    const renderizarCampo = (campo: CampoConfiguracao) => {
        if (campo.tipo === "numero") {
            return <InputNumber style={{ width: "100%" }} value={valores[campo.chave] as number | undefined} onChange={(valor) => aoAlterar(campo.chave, valor ?? 0)} min={0} />;
        }
        if (campo.tipo === "booleano") {
            return <Switch checked={Boolean(valores[campo.chave])} onChange={(valor) => aoAlterar(campo.chave, valor)} />;
        }
        return <Input value={valores[campo.chave] as string | undefined} onChange={(evento) => aoAlterar(campo.chave, evento.target.value)} />;
    };

    const existeCampo = campos.length > 0;

    return (
        <Modal
            title={titulo}
            open={aberto}
            onOk={aoConfirmar}
            onCancel={aoCancelar}
            okText="Executar"
            cancelText="Cancelar"
            destroyOnClose
        >
            {descricao && <p style={{ marginBottom: 16 }}>{descricao}</p>}
            {existeCampo && <Divider style={{ margin: "12px 0" }} />}
            {existeCampo && campos.map((campo) => (
                <div key={campo.chave} style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span>{campo.rotulo}</span>
                        <Button
                            type="text"
                            size="small"
                            icon={<InfoCircleOutlined />}
                            onClick={() => definirCampoDetalhado(campo)}
                        />
                    </div>
                    {renderizarCampo(campo)}
                    {campo.descricao && <small style={{ color: "#555" }}>{campo.descricao}</small>}
                </div>
            ))}
            <Modal
                title={campoDetalhado?.rotulo ?? ""}
                open={!!campoDetalhado}
                onOk={() => definirCampoDetalhado(null)}
                onCancel={() => definirCampoDetalhado(null)}
                okText="Fechar"
                cancelButtonProps={{ style: { display: "none" } }}
                destroyOnClose
            >
                <p style={{ marginBottom: 0 }}>{campoDetalhado?.detalhe}</p>
            </Modal>
        </Modal>
    );
};

export type { CampoConfiguracao };
export default ModalConfiguracaoFerramenta;
