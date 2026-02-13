"use client";

import Link from "next/link";
import { paths } from "@/common/constants/paths";
import { useAuthStore } from "@/features/auth/stores/auth-store";

const LANDING_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Research", href: "#research" },
  { label: "Company", href: "#company" }
] as const;

export function Header() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-higgs-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white">
            AI TRYON
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {LANDING_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-higgs-text-muted transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        {isInitializing ? (
          <div className="h-10 w-44" aria-hidden />
        ) : isAuthenticated ? (
          <Link
            href={paths.tryOn}
            className="inline-flex items-center justify-center rounded-xl border border-[#8A6CD9]/60 bg-[#8A6CD9] px-4 py-2 text-sm font-bold text-white shadow-[0_0_16px_rgba(138,108,217,0.3)] transition-all hover:scale-105 hover:bg-[#9C81E1] hover:shadow-[0_0_24px_rgba(138,108,217,0.42)]"
          >
            Open app
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href={paths.signIn}
              className="text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              Log in
            </Link>
            <Link
              href={paths.signUp}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-105"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
