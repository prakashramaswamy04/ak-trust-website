import Link from "next/link";
import { Lock, LogOut, Trash2, Undo2 } from "lucide-react";
import { logoutAction, deleteMemberAction, reverseEntryAction } from "@/app/actions";
import { AddDisbursementForm, AddDonationForm, AddMemberForm, AddPaymentForm, EditMemberForm, EditPaymentForm, LoginForm } from "@/components/admin-forms";
import { PageHeader } from "@/components/ui";
import { currentAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/finance";
import { getState, usingSupabase } from "@/lib/store";

export const dynamic = "force-dynamic";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-surface p-5">
      <h2 className="mb-4 text-lg font-bold text-emerald-950">{title}</h2>
      {children}
    </section>
  );
}

function ReverseButton({ kind, id }: { kind: string; id: string }) {
  return (
    <form action={reverseEntryAction}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <button title="Reverse entry" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-700"><Undo2 className="h-4 w-4" /></button>
    </form>
  );
}

export default async function AdminPage() {
  const adminName = await currentAdmin();
  if (!adminName) {
    return (
      <main className="mx-auto max-w-md px-4 py-20">
        <div className="card-surface p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900 text-white"><Lock className="h-5 w-5" /></div>
          <h1 className="text-center text-2xl font-bold text-emerald-950">Admin sign in</h1>
          <p className="mb-6 mt-1 text-center text-sm text-slate-500">Only trust admins can add or remove members and record payments.</p>
          <LoginForm />
        </div>
      </main>
    );
  }

  const state = await getState();
  const payments = state.members
    .flatMap((m) => m.payments.map((p) => ({ ...p, memberName: m.name })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 15);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader eyebrow="Admin" title={`Welcome, ${adminName}`} subtitle={`Data stored in ${usingSupabase() ? "Supabase" : "a local file (demo mode — add Supabase keys to go live)"}.`} />
        <form action={logoutAction}><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><LogOut className="h-4 w-4" />Sign out</button></form>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Record member payment"><AddPaymentForm members={state.members.map((m) => ({ id: m.id, name: m.name }))} /></Panel>
        <Panel title="Record donor donation"><AddDonationForm /></Panel>
        <Panel title="Record disbursement"><AddDisbursementForm /></Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title={`Members (${state.members.length})`}>
          <AddMemberForm />
          <ul className="mt-4 max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {state.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/members/${m.id}`} className="hover:underline">{m.name}</Link>
                <div className="flex items-center gap-1">
                <EditMemberForm id={m.id} name={m.name} />
                <form action={deleteMemberAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button title="Delete member" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </form>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6 lg:col-span-2">
          <Panel title="Recent member payments">
            {payments.length === 0 ? <p className="text-sm text-slate-500">No payments yet.</p> : (
              <ul className="divide-y divide-slate-100 text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="relative flex items-center justify-between py-2.5">
                    <div className={p.reversed ? "text-slate-400 line-through" : ""}>
                      <span className="font-medium">{p.memberName}</span> <span className="text-slate-500">· {formatDate(p.date)} · {p.reference}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${p.reversed ? "text-slate-400 line-through" : "text-emerald-800"}`}>{formatCurrency(p.amount)}</span>
                      {p.reversed ? null : <><EditPaymentForm id={p.id} amount={p.amount} date={p.date} reference={p.reference} /><ReverseButton kind="payment" id={p.id} /></>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Donations">
              {state.donations.length === 0 ? <p className="text-sm text-slate-500">None yet.</p> : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {state.donations.map((d) => (
                    <li key={d.id} className="flex items-center justify-between py-2.5">
                      <span className={d.reversed ? "text-slate-400 line-through" : ""}>{d.donorName} · {formatCurrency(d.amount)}</span>
                      {d.reversed ? null : <ReverseButton kind="donation" id={d.id} />}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel title="Disbursements">
              {state.disbursements.length === 0 ? <p className="text-sm text-slate-500">None yet.</p> : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {state.disbursements.map((d) => (
                    <li key={d.id} className="flex items-center justify-between py-2.5">
                      <span className={d.reversed ? "text-slate-400 line-through" : ""}>{d.recipientName} · {formatCurrency(d.amount)}</span>
                      {d.reversed ? null : <ReverseButton kind="disbursement" id={d.id} />}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
          <Panel title="Audit log">
            {(state.auditLog ?? []).length === 0 ? <p className="text-sm text-slate-500">No admin activity recorded yet.</p> : (
              <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto text-sm">
                {(state.auditLog ?? []).slice(0, 50).map((a) => (
                  <li key={a.id} className="py-2">
                    <span className="font-medium">{a.action}</span> <span className="text-slate-600">· {a.details}</span>
                    <div className="text-xs text-slate-400">{a.admin} · {new Date(a.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
