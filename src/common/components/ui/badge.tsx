import * as React from "react";
import { cn } from "@/common/utils/cn";

export const Badge = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-brand-neon/35 bg-brand-neon/15 px-2.5 py-1 text-xs font-medium text-brand-mist",
        className
      )}
      {...props}
    />
  );
};
