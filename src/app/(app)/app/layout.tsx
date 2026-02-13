import { AuthGuardLayout } from "@/common/layouts/auth-guard-layout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuardLayout>{children}</AuthGuardLayout>;
}
