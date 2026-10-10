import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { formatCurrency } from "@/lib/finance";
import { MonthSelect } from "@/components/month-select";
import { memberRows, monthLabel, monthOptions, parseMonth } from "@/lib/overview";
import { getT } from "@/lib/i18n";
import Link from "next/link";
import { getState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { t } = await getT();
  const state = await getState();
  const monthKey = parseMonth((await searchParams).month);
  const rows = memberRows(state.members, monthKey);
  const month = monthLabel(monthKey);
  const counts = { Paid: 0, "Partially paid": 0, Pending: 0 };
  rows.forEach((r) => counts[r.status]++);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <PageHeader eyebrow={t.members} title={t.monthlyContrib} subtitle={`Status for ${month}. Each member contributes ₹300 a month.`} />
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600">{t.month}</span>
        <MonthSelect value={monthKey} options={monthOptions().map((key) => ({ key, label: monthLabel(key) }))} />
      </div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
          <div key={k} className="card-surface p-4 text-center">
            <div className="text-3xl font-bold text-emerald-950">{counts[k]}</div>
            <div className="metric-label mt-1">{t[k]}</div>
          </div>
        ))}
      </div>
      <div className="card-surface overflow-hidden">
        {rows.length === 0 ? <EmptyState text="No members yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-50/60 text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="px-5 py-3">#</th><th className="px-5 py-3">{t.member}</th><th className="px-5 py-3">{month}</th><th className="px-5 py-3">{t.totalPaid}</th><th className="px-5 py-3">{t.status}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={r.member.id} className="transition hover:bg-emerald-50/40">
                    <td className="px-5 py-3.5 text-slate-400">{i + 1}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900"><Link href={`/members/${r.member.id}`} className="hover:text-emerald-800 hover:underline">{r.member.name}</Link></td>
                    <td className="px-5 py-3.5">{formatCurrency(r.paidThisMonth)} <span className="text-slate-400">/ {formatCurrency(r.expected)}</span></td>
                    <td className="px-5 py-3.5 text-slate-600">{formatCurrency(r.paidTotal)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.status} label={t[r.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
