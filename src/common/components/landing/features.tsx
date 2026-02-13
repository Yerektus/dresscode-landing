"use client";

import { motion } from "framer-motion";

export function Features() {
  return (
    <section id="research" className="scroll-mt-24 bg-higgs-bg py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-[0.02em] text-white md:text-6xl md:tracking-[0.03em]">
            <span className="block">
              AI TRYON <span className="text-higgs-text-muted">это</span>{" "}
              <span className="inline-flex whitespace-nowrap rounded-full border border-[#4e4a72] bg-[#2f2c49] px-4 py-1.5 text-[#ddd7ff] md:px-6 md:py-2">
                социальная сеть
              </span>
            </span>
            <span className="mt-2 block">для любителей одежды</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg tracking-[0.01em] text-higgs-text-muted md:text-xl">
            Создавайте образы, делитесь луками и находите единомышленников в fashion-комьюнити.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex min-h-[340px] flex-col justify-between rounded-[32px] border border-[#5e4f8e] bg-[linear-gradient(145deg,#4f2d8f_0%,#2a1d4d_100%)] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:p-10"
          >
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-[#ddd1ff]">ПРОФИЛЬ И ЛУКИ</p>
              <h3 className="mt-6 text-3xl font-bold leading-tight tracking-[0.01em] text-white md:text-4xl">
                Публикуйте свои образы и собирайте реакцию сообщества.
              </h3>
            </div>
            <p className="mt-8 max-w-xl text-lg leading-relaxed tracking-[0.01em] text-[#e8defd]">
              Лента с фото, комментариями и подборками помогает делиться стилем и находить новые идеи.
            </p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex min-h-[340px] flex-col justify-between rounded-[32px] border border-[#6f3d4a] bg-[linear-gradient(150deg,#5a1f30_0%,#2f141f_100%)] p-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:p-10"
          >
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-[#f1c4cc]">РЕКОМЕНДАЦИИ ПО СТИЛЮ</p>
              <h3 className="mt-6 text-3xl font-bold leading-tight tracking-[0.01em] text-white md:text-4xl">
                Получайте персональные советы и находите вещи под свой гардероб.
              </h3>
            </div>
            <p className="mt-8 max-w-xl text-lg leading-relaxed tracking-[0.01em] text-[#f0d7dc]">
              AI и активность сообщества подсказывают, что примерить дальше, чтобы быстрее собрать идеальный look.
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
