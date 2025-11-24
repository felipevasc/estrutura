import styled from "styled-components";

export const StyledToolsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    padding: 16px;
    width: 100%;

    .ant-card {
        border: 1px solid var(--border-color);
        background-color: var(--panel-background);
        border-radius: 8px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        &.interactive {
            cursor: pointer;

            &:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                border-color: var(--accent-color);

                .tool-icon {
                    color: var(--accent-color);
                    transform: scale(1.1);
                }

                .ant-card-meta-title {
                    color: var(--accent-color);
                }
            }

            &:active {
                transform: scale(0.98);
            }
        }
    }

    .ant-card-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        flex-grow: 1;
        justify-content: flex-start;
    }

    .tool-icon {
        font-size: 32px;
        margin-bottom: 16px;
        color: var(--foreground);
        opacity: 0.8;
        transition: all 0.2s ease;
    }

    .ant-card-meta {
        width: 100%;
    }

    .ant-card-meta-title {
        font-size: 0.95rem;
        font-weight: 600;
        margin-bottom: 8px !important;
        color: var(--foreground);
        transition: color 0.2s ease;
    }

    .ant-card-meta-description {
        font-size: 0.75rem;
        color: var(--foreground);
        opacity: 0.6;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;
