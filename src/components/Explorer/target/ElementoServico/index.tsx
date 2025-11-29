import { PortaResponse } from "@/types/PortaResponse";
import { faCogs, faServer, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NoCarregavel } from "../tipos";

const useElementoServico = () => {
  const getServico = async (nomeServico: string, portas: PortaResponse[]): Promise<NoCarregavel> => {
    const carregar = async () => {
      const mapa = new Map<number, { ip: any, portas: PortaResponse[] }>();
      portas.forEach(p => {
        if (p.ipId && p.ip) {
          if (!mapa.has(p.ipId)) mapa.set(p.ipId, { ip: p.ip, portas: [] });
          mapa.get(p.ipId)?.portas.push(p);
        }
      });

      const filhosIps: NoCarregavel[] = [];
      for (const [ipId, data] of mapa) {
        const { ip } = data;
        const portasIp = data.portas.map(p => p.numero).join(", ");
        const filhosUsuarios: NoCarregavel[] = [];
        if (ip.usuarios && ip.usuarios.length > 0) {
          ip.usuarios.forEach((u: any) => {
            filhosUsuarios.push({
              key: `service-${nomeServico}-ip-${ipId}-user-${u.id}`,
              title: <div><FontAwesomeIcon icon={faUser} /> {u.nome}</div>,
              isLeaf: true
            });
          });
        }

        filhosIps.push({
          key: `service-${nomeServico}-ip-${ipId}`,
          title: <div><FontAwesomeIcon icon={faServer} /> {ip.endereco} <span style={{ fontSize: "0.8em", color: "#888" }}>({portasIp})</span></div>,
          children: filhosUsuarios.length ? filhosUsuarios : undefined,
          isLeaf: filhosUsuarios.length === 0
        });
      }

      return filhosIps;
    };

    return {
      key: `service-${nomeServico}`,
      title: <div><FontAwesomeIcon icon={faCogs} /> {nomeServico}</div>,
      children: portas.length ? undefined : [],
      className: "servico",
      isLeaf: portas.length === 0,
      carregar: portas.length ? carregar : undefined
    };
  };

  return { getServico };
};

export default useElementoServico;
