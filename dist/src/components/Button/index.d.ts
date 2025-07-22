export type BotaoTypeProps = 'primary' | 'secondary' | 'tertiary';
export type BotaoFormatProps = 'normal' | 'circle' | 'block';
export type BotaoSizeProps = 'large' | 'medium' | 'small';
export type BotaoProps = {
    type?: BotaoTypeProps;
    format?: BotaoFormatProps;
    children?: React.ReactNode;
    size?: BotaoSizeProps;
    loading?: boolean;
    disabled?: boolean;
    darkMode?: boolean;
};
declare const Button: React.FC<BotaoProps>;
export default Button;
