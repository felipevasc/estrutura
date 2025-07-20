'use client'

import React, { useState } from 'react'

export type AccordionItemProps = {
    title: string;
    content: React.ReactNode
}

const AccordionItem: React.FC<AccordionItemProps> = ({ content, title }) => {
  const [active, setActive] = useState(false)

  const alternarAtivo = () => {
    setActive(!active)
  }

  return (
    <>
      <div className="item" {...{ active: active ? 'active' : undefined }}>
        <button className="header" type="button" onClick={alternarAtivo}>
          <span className="icon">
            <i className="fas fa-angle-down" aria-hidden="true" />
          </span>
          <span className="title">{title}</span>
        </button>
      </div>
      <div className="content">
        {content}
      </div>
    </>
  )
}

export default AccordionItem