"use client";

import { useActionState, useEffect, useRef } from "react";
import { editMemberAction, editPaymentAction, addDisbursementAction, addDonationAction, addMemberAction, addPaymentAction, loginAction, type ActionResult } from "@/app/actions";

type Action = (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;

function Form({ action, children, submit }: { action: Action; children: React.ReactNode; submit: string }) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={formAction} className="space-y-3">
      {children}
      <button className="btn w-full" disabled={pending}>{pending ? "Saving…" : submit}</button>
      {state ? <p role="status" className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p> : null}
    </form>
  );
}

const today = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);

export function LoginForm() {
  return (
    <Form action={loginAction} submit="Sign in">
      <input className="input" name="username" placeholder="Username" autoComplete="username" required autoFocus />
      <input className="input" type="password" name="password" placeholder="Password" required />
    </Form>
  );
}

export function AddMemberForm() {
  return (
    <Form action={addMemberAction} submit="Add member">
      <input className="input" name="name" placeholder="Member name" required />
    </Form>
  );
}

export function AddPaymentForm({ members }: { members: { id: string; name: string }[] }) {
  return (
    <Form action={addPaymentAction} submit="Record payment">
      <select className="input" name="memberId" required defaultValue="">
        <option value="" disabled>Select member</option>
        {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input className="input" type="number" name="amount" min={1} defaultValue={300} required />
        <input className="input" type="date" name="date" defaultValue={today()} max={today()} required />
      </div>
      <input className="input" name="reference" placeholder="Reference (UPI ID / Cash)" />
    </Form>
  );
}

export function AddDonationForm() {
  return (
    <Form action={addDonationAction} submit="Record donation">
      <input className="input" name="donorName" placeholder="Donor name" />
      <div className="grid grid-cols-2 gap-3">
        <input className="input" type="number" name="amount" min={1} placeholder="Amount ₹" required />
        <input className="input" type="date" name="date" defaultValue={today()} max={today()} required />
      </div>
      <input className="input" name="paymentMethod" placeholder="Method (UPI / Cash / Bank)" defaultValue="UPI" required />
      <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" name="anonymous" /> Show as anonymous</label>
    </Form>
  );
}

export function AddDisbursementForm() {
  return (
    <Form action={addDisbursementAction} submit="Record disbursement">
      <input className="input" name="recipientName" placeholder="Recipient" required />
      <input className="input" name="purpose" placeholder="Purpose" required />
      <div className="grid grid-cols-2 gap-3">
        <input className="input" type="number" name="amount" min={1} placeholder="Amount ₹" required />
        <input className="input" type="date" name="date" defaultValue={today()} max={today()} required />
      </div>
      <input className="input" name="paymentMethod" placeholder="Method (UPI / Cash / Bank)" defaultValue="UPI" required />
      <input className="input" name="receiptUrl" placeholder="Receipt link (optional, https://… or /proof/…)" />
    </Form>
  );
}

export function EditMemberForm({ id, name }: { id: string; name: string }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none rounded-lg p-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50">Edit</summary>
      <div className="mt-2 w-60 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <Form action={editMemberAction} submit="Save">
          <input type="hidden" name="id" value={id} />
          <input className="input" name="name" defaultValue={name} required />
        </Form>
      </div>
    </details>
  );
}

export function EditPaymentForm({ id, amount, date, reference }: { id: string; amount: number; date: string; reference: string }) {
  return (
    <details>
      <summary className="cursor-pointer list-none rounded-lg p-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50">Edit</summary>
      <div className="absolute right-4 z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <Form action={editPaymentAction} submit="Save">
          <input type="hidden" name="id" value={id} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number" name="amount" min={1} defaultValue={amount} required />
            <input className="input" type="date" name="date" defaultValue={date} max={today()} required />
          </div>
          <input className="input" name="reference" defaultValue={reference} placeholder="Reference" />
        </Form>
      </div>
    </details>
  );
}
