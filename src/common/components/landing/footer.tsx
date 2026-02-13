export function Footer() {
  return (
    <footer id="company" className="scroll-mt-24 border-t border-white/5 bg-higgs-bg py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="flex items-center gap-2">
           <span className="text-lg font-bold text-white">AI TRYON</span>
           <span className="text-xs text-higgs-text-muted">© 2026</span>
        </div>
        
        <a
          href="https://t.me/aitryon"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-higgs-text-muted transition-colors hover:text-white"
        >
          Telegram
        </a>
      </div>
    </footer>
  );
}
