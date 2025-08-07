import { useContext } from 'react';
import { TreeDataNode } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired, faServer } from '@fortawesome/free-solid-svg-icons';
import StoreContext from '@/store';
import { RedeResponse } from '@/types/RedeResponse';
import { IpResponse } from '@/types/IpResponse';

const useElementoRede = () => {
    const { selecaoTarget } = useContext(StoreContext);

    const getRede = async (rede: RedeResponse): Promise<TreeDataNode> => {
        const ips: TreeDataNode[] = rede.ips ? await Promise.all(rede.ips.map(ip => getIp(ip))) : [];

        return {
            key: `rede-${rede.id}`,
            title: rede.cidr,
            icon: <FontAwesomeIcon icon={faNetworkWired} />,
            children: ips,
        };
    };

    const getIp = async (ip: IpResponse): Promise<TreeDataNode> => {
        return {
            key: `ip-${ip.id}`,
            title: ip.endereco,
            icon: <FontAwesomeIcon icon={faServer} />,
        };
    };

    return { getRede, getIp };
};

export default useElementoRede;
