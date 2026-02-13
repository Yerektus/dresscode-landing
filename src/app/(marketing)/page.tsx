import { Header } from "@/common/components/landing/header";
import { Hero } from "@/common/components/landing/hero";
import { Features } from "@/common/components/landing/features";
import { Footer } from "@/common/components/landing/footer";

export default function MarketingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-higgs-bg text-white">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
