import Link from "next/link";
import { paths } from "@/common/constants/paths";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-higgs-bg px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-20 h-48 w-48 rounded-full bg-brand-sky/10 blur-3xl" />
        <div className="absolute -right-16 bottom-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <section className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-surface/50 p-7 shadow-panel backdrop-blur-sm sm:p-10">
        <p className="text-xs font-semibold tracking-[0.22em] text-brand-mist/50">ERROR 404</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Страница не найдена</h1>
        <p className="mt-4 max-w-xl text-base text-higgs-text-muted sm:text-lg">
          Проверьте адрес страницы или вернитесь в приложение, чтобы продолжить примерку.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={paths.tryOn}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#8A6CD9]/60 bg-[#8A6CD9] px-6 text-sm font-bold text-white transition hover:bg-[#9C81E1] hover:shadow-[0_0_20px_rgba(138,108,217,0.45)]"
          >
            В приложение
          </Link>
          <Link
            href={paths.landing}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-white transition hover:bg-white/10 hover:border-white/20"
          >
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}
