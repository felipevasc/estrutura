export type SelecaoTarget = {
    id: number;
    tipo: "domain" | "ip" | "network" | "user" | "database";
    endereco?: string;
};
