"use client";

import Accordion from "@/components/Accordion";
import Button from "@/components/Button";
import Menu from "@/components/Menu";
import { MenuItemProps } from "@/components/Menu/MenuItem";


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
    </div>
}

export default Page;