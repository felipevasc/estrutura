import useApi from "@/api";
import StoreContext from "@/store";
import { Table } from "antd";
import { useContext, useEffect, useState } from "react";

const SambaInfo = () => {
    const api = useApi();
    const { selecaoTarget } = useContext(StoreContext);
    const [users, setUsers] = useState([]);
    const [shares, setShares] = useState([]);

    useEffect(() => {
        const ipId = selecaoTarget?.get()?.id;
        if (ipId) {
            api.ips.getSambaInfo(ipId.toString()).then((data) => {
                setUsers(data.users);
                setShares(data.shares);
            });
        }
    }, [selecaoTarget, api.ips]);

    const userColumns = [
        { title: 'User', dataIndex: 'nome', key: 'nome' },
        { title: 'RID', dataIndex: 'rid', key: 'rid' },
    ];

    const shareColumns = [
        { title: 'Share Name', dataIndex: 'nome', key: 'nome' },
        { title: 'Type', dataIndex: 'tipo', key: 'tipo' },
        { title: 'Comment', dataIndex: 'comentario', key: 'comentario' },
    ];

    return (
        <div>
            <h3>Samba Users</h3>
            <Table dataSource={users} columns={userColumns} rowKey="id" />
            <h3>Samba Shares</h3>
            <Table dataSource={shares} columns={shareColumns} rowKey="id" />
        </div>
    );
}

export default SambaInfo;
