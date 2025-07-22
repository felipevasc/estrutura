import React from "react";
const Table = ({ actions, data, children }) => {
    const columns = React.Children.toArray(children)
        .filter(child => React.isValidElement(child) &&
        child.type.displayName === "TableThead")
        .map(child => child.props);
    return <div className="br-table">
        <table>
            <thead>
                <tr>
                    {columns.map((h, idx) => {
            var _a, _b;
            return (<th key={idx} colSpan={(_a = h.colspan) !== null && _a !== void 0 ? _a : 1}>
                            {(_b = h.title) !== null && _b !== void 0 ? _b : h.column}
                        </th>);
        })}
                    {actions && Object.keys(actions).length > 0 && <th style={{ width: '100px', whiteSpace: 'nowrap', textAlign: 'center' }}>Ações</th>}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (<tr key={i}>
                        {columns.map((h, idx) => (<td key={idx}>
                                {h.render ? h.render(row) : h.column ? row[h.column] : null}
                            </td>))}
                        {actions && Object.keys(actions).length > 0 && (<td style={{ textAlign: 'center', width: '100px', whiteSpace: 'nowrap' }}>
                                {Object.entries(actions).map(([key, action]) => (<button key={key} onClick={() => action.action(row)} title={action.title} className={`br-table-action ${action.icon}`}>
                                        <i className={`fas fa-icon-${action.icon}`}></i>
                                        {action.icon}
                                    </button>))}
                            </td>)}
                    </tr>))}
            </tbody>
        </table>
    </div>;
};
const Thead = (props) => null;
Thead.displayName = "TableThead";
Table.Thead = Thead;
export default Table;
