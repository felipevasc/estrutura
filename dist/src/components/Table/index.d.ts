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
    };
};
export type TableProps<T = unknown> = {
    data: T[];
    children?: React.ReactNode;
    actions?: TableActionsProps<T>;
};
declare const Table: {
    <T>({ actions, data, children }: TableProps<T>): React.JSX.Element;
    Thead: {
        <T>(props: TableTheadProps<T>): null;
        displayName: string;
    };
};
export default Table;
