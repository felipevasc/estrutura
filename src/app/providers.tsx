"use client";

import React, { useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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

function TemaProvider({ children }: { children: React.ReactNode }) {
  const { tema } = useContext(StoreContext);
  const temaAtual = temas[tema?.get() ?? "sombrio"];

  return (
    <ThemeProvider theme={temaAtual}>
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
        <TemaProvider>{children}</TemaProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
