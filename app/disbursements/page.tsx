import Image from "next/image";
import { EmptyState, PageHeader } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/finance";
import { getT } from "@/lib/i18n";
import { getState } from "@/lib/store";


const PROOFS = [
  { src: "/proof/receipt-2026.png", title: "Receipt No. 1163 · ₹56,500", note: "Thozhamai Illam · 5 Oct 2026", fit: "object-cover object-center" },
  { src: "/proof/receipt-2025.png", title: "Receipt No. 737 · ₹31,000", note: "Thozhamai Illam · 6 Oct 2025", fit: "object-cover object-top" },
  { src: "/proof/handover.png", title: "Handover to Thozhamai Illam", note: "6 Oct 2025", fit: "object-cover object-center" },
];

export const dynamic = "force-dynamic";

export default async function DisbursementsPage() {
  const { t } = await getT();
  const state = await getState();
  const list = state.disbursements.filter((d) => !d.reversed).sort((a, b) => b.disbursementDate.localeCompare(a.disbursementDate));
  const total = list.reduce((t, d) => t + d.amount, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <PageHeader eyebrow={t.disbursements} title={t.whereTheFundsWent} subtitle="Every donation made to beneficiaries and organizations." />
      <div className="card-surface mb-6 flex items-center justify-between p-5">
        <span className="metric-label">{t.totalDonated}</span>
        <span className="text-2xl font-bold text-emerald-950">{formatCurrency(total)}</span>
      </div>
      <div className="card-surface overflow-hidden">
        {list.length === 0 ? <EmptyState text="No disbursements recorded yet." /> : (
          <ul className="divide-y divide-slate-100">
            {list.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <div className="font-medium text-slate-900">{d.recipientName}</div>
                  <div className="text-sm text-slate-600">{d.purpose}</div>
                  <div className="text-xs text-slate-400">{formatDate(d.disbursementDate)}</div>
                </div>
                <div className="flex items-center gap-4">
                  {d.receiptUrl ? (
                    <a href={d.receiptUrl} target="_blank" rel="noreferrer" title={t.viewReceipt} className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200 transition hover:ring-emerald-600">
                      <Image src={d.receiptUrl} alt={t.viewReceipt} fill sizes="56px" className="object-cover object-top" unoptimized={d.receiptUrl.startsWith("http")} />
                    </a>
                  ) : null}
                  <div className="font-bold text-amber-700">{formatCurrency(d.amount)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-emerald-950">{t.proof}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PROOFS.map((p) => (
            <a key={p.src} href={p.src} target="_blank" rel="noreferrer" className="card-surface block overflow-hidden transition hover:shadow-lg">
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image src={p.src} alt={p.title} fill sizes="(min-width: 640px) 33vw, 100vw" className={p.fit} />
              </div>
              <div className="p-4">
                <div className="font-semibold text-slate-900">{p.title}</div>
                <div className="text-sm text-slate-500">{p.note}</div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
