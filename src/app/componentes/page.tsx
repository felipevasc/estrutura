"use client";

import Accordion from "@/common/components/Accordion";
import Button from "@/common/components/Button";
import Menu from "@/common/components/Menu";
import { MenuItemProps } from "@/common/components/Menu/MenuItem";
import Table from "@/common/components/Table";
import Terminal from "@/common/components/Terminal";


const menuItems: MenuItemProps[] = [
    {
        title: 'Nivel 1',
        subitems: [
            { title: 'Nivel 2 - A', onClick: () => alert('Nivel 2 - A') },
            {
                title: 'Nivel 2 - B',
                subitems: [
                    { title: 'Nivel 3' }
                ]
            }
        ]
    }
];

const Page = () => {
    return <div>
        <h4>Botao</h4>
        <Button type="primary">Texto Botao</Button>
        <hr />
        <h4>Accordion</h4>
        <Accordion items={[{ title: 'Item 1', content: 'Conteudo item 1' }, { title: 'Item 2', content: "Conteudo item 2" }]} />
        <hr />
        <h4>Menu</h4>
        <Menu items={menuItems} />
        <hr />
        <h4>Table</h4>
        <Table data={[{ id: 1, nome: 'Nome 1' }, { id: 2, nome: 'Nome 2' }]} actions={{ editar: { icon: 'edit', title: 'Editar', action: (row) => alert(`Editar ${row?.id}`) }, excluir: { icon: 'trash', title: 'Excluir', action: (row) => alert(`Excluir ${row?.id}`) } }}>
            <Table.Thead column="id" title="ID" />
            <Table.Thead column="nome" title="Nome" />
        </Table>
        <hr/>
        <h4>Terminal</h4>
        <Terminal children="asd" />
        <hr/>
        <hr/>
    </div>
}

export default Page;