"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/common/utils/cn";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "glass" | "outline";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-surface/50 border border-white/5 shadow-panel backdrop-blur-sm",
      glass: "bg-surface/60 backdrop-blur-xl border border-white/10 shadow-glass-inset",
      outline: "bg-transparent border border-white/10",
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn("rounded-3xl overflow-hidden p-5 md:p-6", variants[variant], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";
