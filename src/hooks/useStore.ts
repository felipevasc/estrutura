'use client';

import { useContext } from "react";
import StoreContext from "@/store";
import { StoreType } from "@/store/types/StoreType";

export const useStore = (): StoreType => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
};
