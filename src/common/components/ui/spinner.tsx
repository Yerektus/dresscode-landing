import { cn } from "@/common/utils/cn";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-b-transparent",
        className
      )}
      aria-label="Загрузка"
    />
  );
};
