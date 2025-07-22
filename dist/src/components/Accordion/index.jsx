'use client';
import AccordionItem from "./AccordionItem";
const Accordion = ({ items }) => {
    return <div className="br-accordion">
        {items.map((i, idx) => <AccordionItem key={`accordion-item-${i.title}-${idx}`} content={i.content} title={i.title}/>)}
    </div>;
};
export default Accordion;
