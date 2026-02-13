import { AuthGuardLayout } from "@/common/layouts/auth-guard-layout";

import { AppLayout } from "@/common/components/layout/app-layout";

export default function RootAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardLayout>
      <AppLayout>{children}</AppLayout>
    </AuthGuardLayout>
  );
}
