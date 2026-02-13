"use client";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import { paths } from "@/common/constants/paths";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface NonAuthGuardLayoutProps {
  children: React.ReactNode;
}

export const NonAuthGuardLayout = ({ children }: NonAuthGuardLayoutProps) => {
  const router = useRouter();
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace(paths.tryOn);
    }
  }, [isInitializing, isAuthenticated, router]);

  if (isInitializing) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
