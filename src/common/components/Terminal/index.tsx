import './styles.css'
export type TerminalProps = {
    children: React.ReactNode;
}

const Terminal: React.FC<TerminalProps> = ({ children }) => {
   return <pre className='terminal'>{children}</pre>
}

export default Terminal