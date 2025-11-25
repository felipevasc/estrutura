import styled from "styled-components";

export const StyledToolsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 20px;
    padding: 20px;
    width: 100%;

    .ant-card {
        border: 1px solid ${({ theme }) => theme.colors.borderColor};
        background: ${({ theme }) => theme.glass.card};
        border-radius: 12px;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        backdrop-filter: blur(5px);
        box-shadow: ${({ theme }) => theme.shadows.soft};

        &.interactive {
            cursor: pointer;

            &:hover {
                transform: translateY(-5px) scale(1.02);
                box-shadow: ${({ theme }) => theme.shadows.medium};
                border-color: ${({ theme }) => theme.colors.accentColor};

                .tool-icon {
                    color: ${({ theme }) => theme.colors.accentColor};
                    transform: scale(1.15);
                    text-shadow: 0 0 10px ${({ theme }) => theme.colors.accentColor};
                }

                .ant-card-meta-title {
                    color: ${({ theme }) => theme.colors.accentColor};
                }
            }

            &:active {
                transform: scale(0.98);
                box-shadow: ${({ theme }) => theme.shadows.inner};
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
        color: ${({ theme }) => theme.colors.text};
        opacity: 0.8;
        transition: all 0.3s ease;
    }

    .ant-card-meta {
        width: 100%;
    }

    .ant-card-meta-title {
        font-size: 0.95rem;
        font-weight: 600;
        margin-bottom: 8px !important;
        color: ${({ theme }) => theme.colors.text};
        transition: color 0.2s ease;
    }

    .ant-card-meta-description {
        font-size: 0.75rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        opacity: 0.8;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;
