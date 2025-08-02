import { StyledButton } from "./styles"

export type BotaoTypeProps = 'primary' | 'secondary' | 'tertiary'

export type BotaoFormatProps = 'normal' | 'circle' | 'block'

export type BotaoSizeProps = 'large' | 'medium' | 'small'

export type BotaoProps = {
    type?: BotaoTypeProps,
    format?: BotaoFormatProps,
    children?: React.ReactNode,
    size?: BotaoSizeProps,
    loading?: boolean,
    disabled?: boolean,
    darkMode?: boolean,
    onClick?: () => void,
    checked?: boolean
}

const Button: React.FC<BotaoProps> = ({ type = 'tertiary', format = 'normal', size = 'medium', children, loading = false, disabled = false, darkMode = false, checked, onClick }) => {
    return <StyledButton onClick={onClick} className={`br-button ${type} ${format} ${size} ${loading ? 'loading' : ''} ${darkMode ? 'dark-mode' : ''} ${checked ? 'checked' : ''}`} type="button" disabled={disabled}>
        {children}
    </StyledButton>
}

export default Button