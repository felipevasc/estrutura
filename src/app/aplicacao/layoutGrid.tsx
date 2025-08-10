'use client'
import styled from 'styled-components'

export const GradeLayout = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: ${({ theme }) => theme.gridColumns};
  grid-template-areas: ${({ theme }) => theme.gridAreas};
`

export const AreaTopo = styled.header`
  grid-area: top;
`

export const AreaEsquerda = styled.aside`
  grid-area: left;
`

export const AreaDireita = styled.aside`
  grid-area: right;
`

export const AreaPrincipal = styled.main`
  grid-area: main;
  display: flex;
  flex-direction: ${({ theme }) => theme.direcaoLayout};
  gap: 1rem;
  padding: 1rem;
`

export const AreaRodape = styled.footer`
  grid-area: footer;
`