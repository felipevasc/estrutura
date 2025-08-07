import styled from "styled-components";

export const StyledVisualizadorIp = styled.div`
    padding: 24px;
    background-color: var(--panel-background);
    color: var(--foreground);
    height: 100%;
    overflow-y: auto;

    .ant-tabs-nav {
        margin-bottom: 24px;
    }

    .ant-tabs-tab {
        color: var(--foreground-secondary);
    }

    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: var(--accent-color);
    }

    .ant-tabs-ink-bar {
        background: var(--accent-color);
    }

    .ant-list-item {
        border-bottom: 1px solid var(--border-color) !important;
        padding: 12px 0 !important;
    }

    .ant-list-item-meta-title {
        color: var(--foreground) !important;
        margin-bottom: 4px !important;
    }

    .ant-list-item-meta-description {
        color: var(--foreground-secondary) !important;
    }

    pre {
        background-color: var(--code-background);
        border: 1px solid var(--border-color);
        padding: 16px;
        border-radius: 6px;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: var(--foreground);
    }

    .ant-table {
        background-color: transparent;
    }

    .ant-table-thead > tr > th {
        background-color: var(--table-header-background);
        border-bottom: 1px solid var(--border-color);
        color: var(--foreground);
    }

    .ant-table-tbody > tr > td {
        border-bottom: 1px solid var(--border-color);
        color: var(--foreground);
    }

    .ant-table-tbody > tr.ant-table-row:hover > td {
        background: var(--hover-background);
    }
`;
