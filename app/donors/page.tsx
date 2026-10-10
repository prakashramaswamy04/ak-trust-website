import { EmptyState, PageHeader } from "@/components/ui";
import { formatCurrency, formatDate, getPublicDonationList } from "@/lib/finance";
import { getT } from "@/lib/i18n";
import { getState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DonorsPage() {
  const { t } = await getT();
  const state = await getState();
  const list = getPublicDonationList(state.donations).sort((a, b) => b.donationDate.localeCompare(a.donationDate));
  const total = list.reduce((t, d) => t + d.amount, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <PageHeader eyebrow={t.donors} title={t.externalDonations} subtitle="Thank you to everyone who has given beyond the monthly member contributions." />
      <div className="card-surface mb-6 flex items-center justify-between p-5">
        <span className="metric-label">{t.totalDonorFunding}</span>
        <span className="text-2xl font-bold text-emerald-950">{formatCurrency(total)}</span>
      </div>
      <div className="card-surface overflow-hidden">
        {list.length === 0 ? <EmptyState text="No external donations recorded yet." /> : (
          <ul className="divide-y divide-slate-100">
            {list.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <div className="font-medium text-slate-900">{d.donorName}</div>
                  <div className="text-xs text-slate-500">{formatDate(d.donationDate)}</div>
                </div>
                <div className="font-bold text-emerald-900">{formatCurrency(d.amount)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
