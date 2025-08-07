import styled from "styled-components";

export const StyledFerramentasIp = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;

    .ant-card {
        cursor: pointer;
        border: 1px solid var(--border-color);
        background-color: var(--panel-background);
        border-radius: 6px;
        transition: all 0.2s ease-in-out;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        &:hover {
            background-color: var(--hover-background);
            border-color: var(--accent-color);
            transform: translateY(-2px);
        }

        &:active {
            transform: scale(0.98) translateY(0);
            background-color: var(--hover-background);
        }
    }

    .ant-card-head {
        text-align: center;
        min-height: 20px;
        padding: 0 12px;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.875rem;
        font-weight: 600;
    }

    .ant-card-body {
        padding: 12px;
        font-size: 0.8rem;
        flex-grow: 1;
    }

    .ant-card-head *,
    .ant-card-body * {
        color: var(--foreground) !important;
    }
`
