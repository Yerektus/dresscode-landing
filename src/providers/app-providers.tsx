"use client";

import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { AuthBootstrap } from "@/common/components/common/auth-bootstrap";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      <AuthBootstrap />
      {children}
      <ToastProvider />
    </QueryProvider>
  );
};
