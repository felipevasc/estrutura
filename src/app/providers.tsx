"use client";

import React, { useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StoreContext, { StoreProvider } from "@/store";
import { ThemeProvider } from "styled-components";
import { GlobalStyles, temas } from "@/theme";

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

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Tema>
          {children}
        </Tema>
      </StoreProvider>
    </QueryClientProvider>
  );
}

function Tema({ children }: { children: React.ReactNode }) {
  const { tema } = useContext(StoreContext)
  const selecionado = temas[tema?.get() || 'dark']
  return (
    <ThemeProvider theme={selecionado}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  )
}