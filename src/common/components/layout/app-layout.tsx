import { AppSidebar } from "./app-sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-higgs-bg">
      <AppSidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+4.75rem)] sm:px-6 sm:pb-8 sm:pt-[calc(env(safe-area-inset-top)+5rem)] lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
