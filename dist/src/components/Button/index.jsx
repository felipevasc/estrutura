const Button = ({ type = 'tertiary', format = 'normal', size = 'medium', children, loading = false, disabled = false, darkMode = false }) => {
    return <button className={`br-button ${type} ${format} ${size} ${loading ? 'loading' : ''} ${darkMode ? 'dark-mode' : ''} mr-3`} type="button" disabled={disabled}>{children}</button>;
};
export default Button;
