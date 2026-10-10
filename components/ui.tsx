import type { PaymentStatus } from "@/lib/finance";

export function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: "gold" | "green" }) {
  return (
    <div className="card-surface relative overflow-hidden p-5">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent === "gold" ? "bg-amber-500" : "bg-emerald-800"}`} />
      <div className="metric-label">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{value}</div>
      {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

const statusStyles: Record<PaymentStatus, string> = {
  Paid: "bg-emerald-100 text-emerald-800",
  "Partially paid": "bg-amber-100 text-amber-800",
  Pending: "bg-slate-100 text-slate-600",
};

export function StatusBadge({ status, label }: { status: PaymentStatus; label?: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>{label ?? status}</span>;
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-emerald-950 md:text-4xl">{title}</h1>
      {subtitle ? <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="px-6 py-12 text-center text-sm text-slate-500">{text}</div>;
}
