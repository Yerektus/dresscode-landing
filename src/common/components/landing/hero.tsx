"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { paths } from "@/common/constants/paths";

export function Hero() {
  return (
    <section id="product" className="relative min-h-screen w-full scroll-mt-24 overflow-hidden bg-higgs-bg pt-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-24">
        <div className="flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-5xl font-bold leading-[0.9] text-white md:text-7xl lg:text-8xl"
          >
            AI
            <br />
            <span className="text-higgs-text-muted">TRYON</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 max-w-xl text-lg text-higgs-text-muted"
          >
            Веб-платформа виртуальной примерки одежды на базе AI: загружайте фото, выбирайте вещь и получайте реалистичный результат.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Link
              href={paths.signIn}
              className="inline-flex items-center justify-center rounded-2xl border border-[#8A6CD9]/60 bg-[#8A6CD9] px-8 py-4 text-base font-bold text-white shadow-[0_0_16px_rgba(138,108,217,0.3)] transition-all hover:scale-105 hover:bg-[#9C81E1] hover:shadow-[0_0_24px_rgba(138,108,217,0.42)]"
            >
              Попробовать
            </Link>
          </motion.div>
        </div>

        <div className="relative h-[600px] w-full">
          <div className="absolute inset-0 grid grid-cols-2 gap-4">
             {/* Creating a Bento-style grid with placeholders */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5, delay: 0.2 }}
               className="col-span-1 row-span-2 overflow-hidden rounded-3xl bg-surface-highlight border border-white/5"
            >
               <div className="h-full w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
            </motion.div>
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="overflow-hidden rounded-3xl bg-surface-highlight border border-white/5"
            >
               <div className="h-full w-full bg-gradient-to-br from-pink-500/20 to-rose-500/20" />
            </motion.div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5, delay: 0.4 }}
               className="overflow-hidden rounded-3xl bg-surface-highlight border border-white/5"
            >
               <div className="h-full w-full bg-gradient-to-br from-violet-500/20 to-violet-500/20" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
