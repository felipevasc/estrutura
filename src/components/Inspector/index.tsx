"use client"
import { Tabs } from "antd";
import { InspectorContainer, InspectorHeader } from "./styles";
import InspectorDetails from "./Details";
import InspectorActions from "./Actions";

const Inspector = () => {
    const items = [
        {
            key: '1',
            label: 'Detalhes',
            children: <InspectorDetails />,
        },
        {
            key: '2',
            label: 'Ações',
            children: <InspectorActions />,
        },
    ];

    return (
        <InspectorContainer>
            <InspectorHeader>
                <Tabs defaultActiveKey="1" items={items} size="small" />
            </InspectorHeader>
            {/* Tabs component handles content rendering internally based on items */}
        </InspectorContainer>
    );
};

export default Inspector;
