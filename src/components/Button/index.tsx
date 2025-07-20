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
    darkMode?: boolean
}

const Button: React.FC<BotaoProps> = ({ type = 'tertiary', format = 'normal', size = 'medium', children, loading = false, disabled = false, darkMode = false }) => {
    return <button className={`br-button ${type} ${format} ${size} ${loading ? 'loading' : ''} ${darkMode ? 'dark-mode' : ''} mr-3`} type="button" disabled={disabled}>{children}</button>
}

export default Button