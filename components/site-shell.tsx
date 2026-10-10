import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "@/components/nav-links";
import { LangToggle } from "@/components/lang-toggle";
import { getT } from "@/lib/i18n";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const { t, lang } = await getT();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/ak-trust-logo.png" alt="AK Trust logo" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-900/10" priority />
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight text-emerald-950">AK Trust</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">{t.tagline}</div>
              <div className="text-[10px] text-slate-500">{t.address}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <NavLinks labels={[t.overview, t.members, t.donors, t.disbursements, t.admin]} />
            <LangToggle current={lang} label={t.lang} />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="mt-16 bg-emerald-950 text-emerald-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image src="/ak-trust-logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
            <div>
              <div className="font-semibold">AK Trust</div>
              <p className="max-w-md text-sm text-emerald-200/80">{t.footer}</p>
              <p className="mt-2 text-sm font-medium text-amber-300">📍 {t.address}</p>
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">Founded 05 Oct 2024 · ₹ INR</div>
        </div>
      </footer>
    </div>
  );
}
