"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/common/utils/cn";
import {
  Home,
  Shirt,
  History,
  Upload,
  CircleUserRound,
  Images,
  User,
  Zap,
  Menu,
  X,
  LogOut,
  type LucideIcon
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { Button } from "@/common/components/ui/button";
import { BillingSheet } from "@/features/billing/components/billing-sheet";
import { Modal } from "@/common/components/ui/modal";
import { toast } from "sonner";

const NAV_ITEMS: Array<{
  label: string;
  href: string;
  icon: LucideIcon;
  activeWhen?: (pathname: string) => boolean;
}> = [
  { label: "Home", href: "/app", icon: Home },
  {
    label: "Looks",
    href: "/app/looks",
    icon: Images,
    activeWhen: (pathname) => pathname === "/app/looks" || pathname.startsWith("/app/looks/")
  },
  {
    label: "Profile",
    href: "/app/profile",
    icon: CircleUserRound,
    activeWhen: (pathname) =>
      pathname.startsWith("/app/profile") ||
      pathname.startsWith("/app/users/")
  },
  { label: "Wardrobe", href: "/app/wardrobe", icon: Shirt },
  { label: "Publish", href: "/app/publish", icon: Upload },
  { label: "History", href: "/app/history", icon: History },
];

const NAV_SECTIONS: Array<{
  title: string;
  items: Array<(typeof NAV_ITEMS)[number]>;
}> = [
  {
    title: "Main",
    items: [NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2]]
  },
  {
    title: "Creator",
    items: [NAV_ITEMS[3], NAV_ITEMS[4]]
  },
  {
    title: "Activity",
    items: [NAV_ITEMS[5]]
  }
];

const CREDIT_STEPS = [5, 10, 20, 50, 100, 250, 500, 1000];

export function AppSidebar() {
  const pathname = usePathname();
  const [openBilling, setOpenBilling] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refreshBalance = useAuthStore((state) => state.refreshBalance);
  const creditsBalance = Math.max(0, user?.creditsBalance ?? 0);

  const { progressPercent, progressLimit } = useMemo(() => {
    const stepLimit =
      CREDIT_STEPS.find((step) => creditsBalance <= step) ??
      Math.ceil(creditsBalance / 500) * 500;
    const nextLimit = Math.max(1, stepLimit);
    const percent = Math.min(100, (creditsBalance / nextLimit) * 100);

    return {
      progressPercent: percent,
      progressLimit: nextLimit
    };
  }, [creditsBalance]);

  const onBillingClose = async (wasPaid?: boolean) => {
    setOpenBilling(false);
    if (!wasPaid) {
      return;
    }

    await refreshBalance();
    toast.success("Баланс обновлен.");
  };

  useEffect(() => {
    setOpenMobileMenu(false);
  }, [pathname]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-higgs-bg/90 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-[calc(3.5rem+env(safe-area-inset-top))] max-w-7xl items-center justify-between px-3 pt-[env(safe-area-inset-top)] sm:px-6">
          <Link href="/" className="text-base font-bold tracking-tighter text-white">
            AI TRYON
          </Link>

          <button
            type="button"
            onClick={() => setOpenMobileMenu(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white transition-colors hover:border-white/30 hover:bg-white/[0.1]"
            aria-label="Открыть меню"
            aria-expanded={openMobileMenu}
            aria-controls="mobile-navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden h-screen w-64 flex-col overflow-y-auto overscroll-contain border-r border-white/5 bg-higgs-bg/95 pt-3 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white">
            AI TRYON
          </Link>
        </div>

        <div className="flex-1 px-4 py-6">
          <nav className="space-y-6">
            {NAV_SECTIONS.map((section) => (
              <section key={section.title} className="space-y-2">
                <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-higgs-text-muted/70">
                  {section.title}
                </p>

                <div className="space-y-2">
                  {section.items.map((item) => {
                    const isActive = item.activeWhen ? item.activeWhen(pathname) : pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href as Route}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-higgs-text-muted hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/5 p-4">
          <div className="mb-4 rounded-xl bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-higgs-text-muted">Credits</span>
              <span className="text-xs font-bold text-violet-300/90">{creditsBalance}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-violet-400/80"
                animate={{
                  width: creditsBalance > 0 ? `${Math.max(progressPercent, 4)}%` : "0%"
                }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 24
                }}
              />
            </div>
            <p className="mt-1 text-[11px] text-higgs-text-muted">
              {creditsBalance}/{progressLimit} кредитов
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-3 h-8 w-full text-xs"
              onClick={() => setOpenBilling(true)}
            >
              <Zap className="mr-2 h-3 w-3" />
              Buy Credits
            </Button>
          </div>

          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <User className="h-4 w-4 text-higgs-text-muted" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-white">{user?.email}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="text-higgs-text-muted transition-colors hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <Modal
        open={openMobileMenu}
        onClose={() => setOpenMobileMenu(false)}
        title="Навигация"
        className="max-w-xl border-white/15 p-0"
      >
        <section id="mobile-navigation" className="overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-higgs-text-muted/70">Navigation</p>
              <p className="text-base font-semibold text-white">Меню приложения</p>
            </div>
            <button
              type="button"
              onClick={() => setOpenMobileMenu(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white transition-colors hover:border-white/30 hover:bg-white/[0.1]"
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 px-4 py-4">
            <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NAV_ITEMS.map((item) => {
                const isActive = item.activeWhen ? item.activeWhen(pathname) : pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={cn(
                      "flex min-h-20 flex-col items-start justify-center gap-1 rounded-xl border px-3 py-3 transition-colors",
                      isActive
                        ? "border-violet-300/55 bg-violet-400/15 text-white"
                        : "border-white/10 bg-white/[0.03] text-higgs-text-muted hover:border-white/20 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.12em] text-higgs-text-muted/70">Credits</span>
                <span className="text-sm font-semibold text-violet-300/90">{creditsBalance}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-violet-400/80"
                  animate={{
                    width: creditsBalance > 0 ? `${Math.max(progressPercent, 4)}%` : "0%"
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 160,
                    damping: 24
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-higgs-text-muted">
                {creditsBalance}/{progressLimit} кредитов
              </p>
              <Button
                variant="primary"
                className="mt-3 h-10 w-full text-sm"
                onClick={() => {
                  setOpenMobileMenu(false);
                  setOpenBilling(true);
                }}
              >
                <Zap className="mr-2 h-4 w-4" />
                Пополнить баланс
              </Button>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-higgs-text-muted/70">Аккаунт</p>
                <p className="truncate text-sm font-medium text-white">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                className="mt-2 h-9 w-full justify-center text-sm"
                onClick={() => {
                  setOpenMobileMenu(false);
                  void logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </section>
      </Modal>

      <BillingSheet open={openBilling} onClose={(wasPaid) => void onBillingClose(wasPaid)} />
    </>
  );
}
