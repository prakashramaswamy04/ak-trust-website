import { getLang } from "@/lib/i18n";
import Script from "next/script";
import type { Metadata } from "next";
import { Geist, Noto_Sans_Tamil } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
});

export const metadata: Metadata = {
  title: "AK Trust | Donation Tracking",
  description: "Transparent donation tracking for AK Trust and charitable giving.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang} suppressHydrationWarning className={`${geistSans.variable} ${notoTamil.variable} h-full antialiased`}>
      <body className="min-h-full bg-stone-50 text-slate-900">
        <Script id="theme-init" strategy="beforeInteractive">{`try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`}</Script>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
