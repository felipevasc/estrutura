import { Socket } from "net";

const testarPorta = (host: string, porta: number) => new Promise<boolean>((resolver) => {
    const conexao = new Socket();
    let concluido = false;
    const encerrar = (valor: boolean) => {
        if (concluido) return;
        concluido = true;
        conexao.destroy();
        resolver(valor);
    };
    const limite = setTimeout(() => encerrar(false), 5000);
    conexao.connect(porta, host, () => {
        clearTimeout(limite);
        encerrar(true);
    });
    conexao.on("error", () => {
        clearTimeout(limite);
        encerrar(false);
    });
});

const limparHost = (alvo: string) => alvo.replace(/^https?:\/\//, "").split("/")[0];

export const alvoAcessivel = async (alvo: string) => {
    const host = limparHost(alvo).toLowerCase().trim();
    if (!host) return false;
    for (const porta of [80, 443]) {
        if (await testarPorta(host, porta)) return true;
    }
    return false;
};
