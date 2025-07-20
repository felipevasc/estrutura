'use client'

import AccordionItem, { AccordionItemProps } from "./AccordionItem";

export type AccordionProps = {
    items: AccordionItemProps[],
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
    return <div className="br-accordion">
        {items.map((i, idx) => <AccordionItem key={`accordion-item-${i.title}-${idx}`} content={i.content} title={i.title} />)}
    </div>
}

export default Accordion;