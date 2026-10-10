import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HandHeart, Users, Wallet } from "lucide-react";
import { InflowChart } from "@/components/charts";
import { StatCard } from "@/components/ui";
import { TRUST_CONFIG, formatCurrency } from "@/lib/finance";
import { FySelect } from "@/components/fy-select";
import { buildOverview, memberRows, monthlySeries, fyOptions, parseFY } from "@/lib/overview";
import { getT } from "@/lib/i18n";
import { getState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
  const { t } = await getT();
  const state = await getState();
  const o = buildOverview(state);
  const rows = memberRows(state.members);
  const paidCount = rows.filter((r) => r.status === "Paid").length;
  const monthCollected = rows.reduce((t, r) => t + r.paidThisMonth, 0);
  const pct = o.monthlyTarget ? Math.min(100, Math.round((monthCollected / o.monthlyTarget) * 100)) : 0;
  const fy = parseFY((await searchParams).fy);
  const series = monthlySeries(state, fy);

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 text-sm ring-1 ring-white/15">
              <Image src="/ak-trust-logo.png" alt="AK Trust logo" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
              {t.founded}
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              {t.heroA}<br /><span className="text-amber-300">{t.heroB}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-emerald-100/90">
              {state.members.length} friends giving {formatCurrency(TRUST_CONFIG.monthlyMemberContribution)} a month to support orphaned children — every rupee tracked in the open.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/members" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-emerald-950 transition hover:bg-amber-300">
                {t.seeStatus} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/disbursements" className="rounded-xl bg-white/10 px-5 py-3 font-semibold ring-1 ring-white/20 transition hover:bg-white/20">{t.whereFunds}</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{t.availableBalance}</div>
            <div className="mt-2 text-5xl font-bold tracking-tight">{formatCurrency(o.availableBalance)}</div>
            <p className="mt-2 text-sm text-emerald-200/80">Opening {formatCurrency(o.openingBalance)} (as of 10 Oct 2026) + inflows − disbursements</p>
            <div className="mt-6">
              <div className="flex justify-between text-sm">
                <span>{t.thisMonth}</span>
                <span className="font-semibold">{formatCurrency(monthCollected)} / {formatCurrency(o.monthlyTarget)}</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-emerald-200/80">{paidCount} / {o.totalMembers} {t.paidFull} · {pct}%</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6 lg:px-8">
        <div className="-mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t.totalCollected} value={formatCurrency(o.totalCollected)} hint="Opening + members + donors" />
          <StatCard label={t.memberContrib} value={formatCurrency(o.memberContributions)} hint="Since tracking began" />
          <StatCard label={t.donorFunding} value={formatCurrency(o.externalDonations)} hint={`${o.recordedExternalDonors} named donors`} accent="gold" />
          <StatCard label={t.fundsDonated} value={formatCurrency(o.disbursements)} hint="Given to beneficiaries" accent="gold" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card-surface p-6 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-emerald-950">{t.monthlyInflow}</h2>
                <p className="text-sm text-slate-500">Oct {fy - 1} – Sep {fy} · members and donors</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-slate-600">
                <FySelect value={fy} options={fyOptions()} />
                <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-800" />{t.members}</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" />{t.donors}</span>
                </div>
              </div>
            </div>
            <div className="mt-4"><InflowChart data={series} /></div>
          </section>

          <section className="card-surface p-6">
            <h2 className="text-xl font-bold text-emerald-950">{t.atAGlance}</h2>
            <ul className="mt-5 space-y-4">
              {[
                { icon: Users, label: t.members, value: String(o.totalMembers) },
                { icon: HandHeart, label: t.monthlyTarget, value: formatCurrency(o.monthlyTarget) },
                { icon: Wallet, label: t.perMember, value: formatCurrency(TRUST_CONFIG.monthlyMemberContribution) },
              ].map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon className="h-5 w-5" /></span>
                  <div className="flex-1 text-sm text-slate-500">{label}</div>
                  <div className="font-bold text-slate-900">{value}</div>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">The opening balance is the total amount collected from October 2024 to October 2026. It is not itemised on this site (the detailed records are kept in the trust\u2019s Excel file) and is counted once.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
