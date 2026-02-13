"use client";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import { paths } from "@/common/constants/paths";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/common/components/ui/spinner";

interface AuthGuardLayoutProps {
  children: React.ReactNode;
}

export const AuthGuardLayout = ({ children }: AuthGuardLayoutProps) => {
  const router = useRouter();
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(paths.signIn);
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-mist">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
