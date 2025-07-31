import React from "react";

export type TableTheadProps<T> = {
    column: string;
    title?: string;
    render?: (row: T) => React.ReactNode;
    colspan?: number;
};

export type TableActionsProps<T> = {
    [key: string]: {
        icon: string;
        title: string;
        action: (row?: T) => void;
    }
}

export type TableProps<T = unknown> = {
    data: T[];
    children?: React.ReactNode;
    actions?: TableActionsProps<T>;
}

const Table = <T,>({ actions, data, children }: TableProps<T>) => {
    const columns = React.Children.toArray(children)
        .filter(child =>
            React.isValidElement(child) &&
            (child.type as { displayName?: string }).displayName === "TableThead"
        )
        .map(child => (child as React.ReactElement<TableTheadProps<T>>).props);

    return <div className="br-table">
        <table>
            <thead>
                <tr>
                    {columns.map((h, idx) => (
                        <th key={idx} colSpan={h.colspan ?? 1}>
                            {h.title ?? h.column}
                        </th>
                    ))}
                    {actions && Object.keys(actions).length > 0 && <th style={{ width: '100px', whiteSpace: 'nowrap', textAlign: 'center' }}>Ações</th>}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i}>
                        {columns.map((h, idx) => (
                            <td key={idx}>
                                {h.render ? h.render(row) : h.column ? row[h.column as keyof T] as React.ReactNode : null}
                            </td>
                        ))}
                        {actions && Object.keys(actions).length > 0 && (
                            <td style={{ textAlign: 'center', width: '100px', whiteSpace: 'nowrap' }}>
                                {Object.entries(actions).map(([key, action]) => (
                                    <button
                                        key={key}
                                        onClick={() => action.action(row)}
                                        title={action.title}
                                        className={`br-table-action ${action.icon}`}
                                    >
                                        <i className={`fas fa-icon-${action.icon}`}></i>
                                        {action.icon}
                                    </button>
                                ))}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}

const Thead = <T,>(props: TableTheadProps<T>) => null;
Thead.displayName = "TableThead";

Table.Thead = Thead;

export default Table;