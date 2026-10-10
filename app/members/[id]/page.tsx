import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { calculateMemberStatus, formatCurrency, formatDate } from "@/lib/finance";
import { getT } from "@/lib/i18n";
import { FIRST_MONTH, monthLabel, monthOptions } from "@/lib/overview";
import { getState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MemberHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getT();
  const state = await getState();
  const m = state.members.find((x) => x.id === id);
  if (!m) notFound();

  const payments = m.payments.filter((p) => !p.reversed).sort((a, b) => b.date.localeCompare(a.date));
  const months = monthOptions().filter((k) => k >= FIRST_MONTH);
  const grid = months.map((key) => {
    const paid = payments.filter((p) => p.date.startsWith(key)).reduce((s, p) => s + p.amount, 0);
    return { key, paid, status: calculateMemberStatus(m.expectedMonthlyContribution, paid) };
  });
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const fullMonths = grid.filter((g) => g.status === "Paid").length;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6 lg:px-8">
      <Link href="/members" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:underline"><ArrowLeft className="h-4 w-4" />{t.backToMembers}</Link>
      <PageHeader eyebrow={t.history} title={m.name} subtitle={`${t.totalPaid}: ${formatCurrency(total)} · ${t.monthsPaid}: ${fullMonths} / ${grid.length}`} />

      <div className="card-surface mb-6 p-5">
        <h2 className="mb-3 text-lg font-bold text-emerald-950">{t.monthsPaid}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {grid.map((g) => (
            <div key={g.key} className="rounded-xl border border-slate-100 p-3">
              <div className="text-sm font-medium text-slate-700">{monthLabel(g.key)}</div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-sm text-slate-500">{formatCurrency(g.paid)}</span>
                <StatusBadge status={g.status} label={t[g.status]} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {payments.length === 0 ? <div className="px-6 py-10 text-center text-sm text-slate-500">{t.noPayments}</div> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-50/60 text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-5 py-3">{t.date}</th><th className="px-5 py-3">{t.amount}</th><th className="px-5 py-3">{t.reference}</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id}><td className="px-5 py-3">{formatDate(p.date)}</td><td className="px-5 py-3 font-semibold text-emerald-900">{formatCurrency(p.amount)}</td><td className="px-5 py-3 text-slate-600">{p.reference}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
