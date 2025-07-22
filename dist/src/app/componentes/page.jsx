"use client";
import Accordion from "@/components/Accordion";
import Button from "@/components/Button";
import Menu from "@/components/Menu";
import Table from "@/components/Table";
const menuItems = [
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
        <Accordion items={[{ title: 'Item 1', content: 'Conteudo item 1' }, { title: 'Item 2', content: "Conteudo item 2" }]}/>
        <hr />
        <h4>Menu</h4>
        <Menu items={menuItems}/>
        <hr />
        <h4>Table</h4>
        <Table data={[{ id: 1, nome: 'Nome 1' }, { id: 2, nome: 'Nome 2' }]} actions={{ editar: { icon: 'edit', title: 'Editar', action: (row) => alert(`Editar ${row === null || row === void 0 ? void 0 : row.id}`) }, excluir: { icon: 'trash', title: 'Excluir', action: (row) => alert(`Excluir ${row === null || row === void 0 ? void 0 : row.id}`) } }}>
            <Table.Thead column="id" title="ID"/>
            <Table.Thead column="nome" title="Nome"/>
        </Table>
    </div>;
};
export default Page;
