import { NonAuthGuardLayout } from "@/common/layouts/non-auth-guard-layout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <NonAuthGuardLayout>{children}</NonAuthGuardLayout>;
}
