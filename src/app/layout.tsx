import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import "@/app/globals.css";
import { AppProviders } from "@/providers/app-providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk"
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sora"
});

export const metadata: Metadata = {
  title: "AI Try-On",
  description: "Виртуальная примерка одежды с AI"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${spaceGrotesk.variable} ${sora.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
