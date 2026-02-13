"use client";

import { Button } from "@/common/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TryOnButtonProps {
  disabled: boolean;
  processing: boolean;
  onClick: () => void;
}

export const TryOnButton = ({ disabled, processing, onClick }: TryOnButtonProps) => {
  return (
    <Button
      disabled={disabled || processing}
      onClick={onClick}
      className="relative h-11 w-full overflow-hidden rounded-2xl text-sm shadow-glow sm:h-12 sm:text-base"
    >
      {processing ? (
        <>
          <motion.span
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0)_65%)]"
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.26)_50%,transparent_80%)]"
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            transition={{ duration: 1.35, repeat: Infinity, ease: "linear" }}
          />
          <span className="relative inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-white/90"
                  animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.14
                  }}
                />
              ))}
            </span>
            <span>AI обрабатывает фото</span>
          </span>
        </>
      ) : (
        <span className="relative inline-flex items-center gap-2">
          <span>Примерить</span>
          <Sparkles className="h-5 w-5" />
          <span>1</span>
        </span>
      )}
    </Button>
  );
};
