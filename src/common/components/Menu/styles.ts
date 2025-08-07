// @/common/components/Menu/styles.ts
"use client";
import styled from 'styled-components';

export const StyledMenu = styled.div`
  height: 100%;
  background-color: var(--panel-background);
`;

export const StyledMenuNav = styled.nav`
  padding: 0.5rem;
`;

export const StyledMenuFolder = styled.div`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

export const StyledMenuItem = styled.a`
  padding-left: 1rem !important;
  color: var(--foreground);
  cursor: pointer;
  display: flex;
  align-items: center;
  border-left: 3px solid transparent;
  transition: all 0.2s ease-in-out;
  padding: 0.5rem 1rem;

  &:hover {
    background-color: var(--hover-background);
    border-left: 3px solid var(--foreground);
  }

  &.bold {
    font-weight: bold;
  }

  .icon {
    margin-left: auto;
    margin-right: 4px;
  }
`;

export const StyledSubMenu = styled.ul`
  padding-left: 16px !important;
  border-left: 1px solid #30363d;
  margin-left: 1rem;
  list-style: none;
`;
