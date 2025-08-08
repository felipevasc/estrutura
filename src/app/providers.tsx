"use client";

import React, { useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StoreContext, { StoreProvider } from "@/store";
import { ThemeProvider } from "styled-components";
import { temas, GlobalStyles } from "@/theme";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

function ProvedorTema({ children }: { children: React.ReactNode }) {
  const { tema } = useContext(StoreContext);
  const atual = tema?.get() ?? "dark";
  return (
    <ThemeProvider theme={temas[atual]}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <ProvedorTema>{children}</ProvedorTema>
      </StoreProvider>
    </QueryClientProvider>
  );
}