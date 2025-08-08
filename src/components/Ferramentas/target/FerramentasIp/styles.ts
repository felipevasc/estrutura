import styled from "styled-components";

export const StyledFerramentasIp = styled.div`
    .ant-card {
        cursor: pointer;
        border: 1px solid var(--border-color);
        background-color: var(--panel-background);
        margin-bottom: 8px;
        border-radius: 6px;
        transition: all 0.2s ease-in-out;

        &:hover {
            background-color: var(--hover-background);
            border-color: var(--accent-color);
        }

        &:active {
            transform: scale(0.98);
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
        padding: 8px 12px;
        font-size: 0.8rem;
    }

    .ant-card-head *,
    .ant-card-body * {
        color: var(--foreground) !important;
    }
`;
