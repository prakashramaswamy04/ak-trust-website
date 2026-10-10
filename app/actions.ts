"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies } from "next/headers";
import { currentAdmin, login, logout } from "@/lib/auth";
import { TRUST_CONFIG } from "@/lib/finance";
import { mutate, newId } from "@/lib/store";

export interface ActionResult {
  ok: boolean;
  message: string;
}

async function requireAdmin(): Promise<string> {
  const name = await currentAdmin();
  if (!name) throw new Error("Admin login required.");
  return name;
}

export async function setLangAction(lang: string) {
  (await cookies()).set("lang", lang === "ta" ? "ta" : "en", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

function done(message: string): ActionResult {
  revalidatePath("/", "layout");
  return { ok: true, message };
}

function fail(error: unknown): ActionResult {
  if (error instanceof z.ZodError) return { ok: false, message: error.issues[0]?.message ?? "Invalid input." };
  return { ok: false, message: error instanceof Error ? error.message : "Something went wrong." };
}

const amount = z.coerce.number().int("Amount must be a whole number.").min(1, "Amount must be at least ₹1.").max(10_000_000);
const date = z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), "Please enter a valid date.").refine((v) => v <= new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10), "Date cannot be in the future.");
const text = (label: string) => z.string().trim().min(1, `${label} is required.`).max(200);

export async function loginAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!(await login(String(form.get("username") ?? ""), String(form.get("password") ?? "")))) return { ok: false, message: "Incorrect username or password." };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin");
}

export async function addMemberAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const name = text("Name").parse(form.get("name"));
    await mutate((s) => {
      if (s.members.some((m) => m.name.toLowerCase() === name.toLowerCase())) throw new Error("A member with this name already exists.");
      s.members.push({ id: newId(), name, fundraisingYear: new Date().getFullYear(), expectedMonthlyContribution: TRUST_CONFIG.monthlyMemberContribution, payments: [] });
      return name;
    }, { admin, action: "Added member" });
    return done(`Added ${name}.`);
  } catch (e) {
    return fail(e);
  }
}

export async function deleteMemberAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  await mutate((s) => {
    const m = s.members.find((x) => x.id === id);
    if (!m) return;
    s.members = s.members.filter((x) => x.id !== id);
    return `${m.name} (${m.payments.length} payments)`;
  }, { admin, action: "Deleted member" });
  revalidatePath("/", "layout");
}

export async function addPaymentAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const memberId = text("Member").parse(form.get("memberId"));
    const data = z.object({ amount, date, reference: z.string().trim().max(200) }).parse({
      amount: form.get("amount"),
      date: form.get("date"),
      reference: form.get("reference") ?? "",
    });
    await mutate((s) => {
      const m = s.members.find((x) => x.id === memberId);
      if (!m) throw new Error("Member not found.");
      m.payments.push({ id: newId(), date: data.date, amount: data.amount, reference: data.reference || "Cash", reversed: false });
      return `${m.name} · ₹${data.amount} · ${data.date}`;
    }, { admin, action: "Recorded payment" });
    return done("Payment recorded.");
  } catch (e) {
    return fail(e);
  }
}

export async function reverseEntryAction(formData: FormData) {
  const admin = await requireAdmin();
  const kind = String(formData.get("kind"));
  const id = String(formData.get("id"));
  await mutate((s) => {
    const reason = `Reversed by ${admin}`;
    let details = "";
    if (kind === "payment") {
      for (const m of s.members) for (const p of m.payments) if (p.id === id) { Object.assign(p, { reversed: true, reversalReason: reason }); details = `${m.name} · ₹${p.amount} · ${p.date}`; }
    } else if (kind === "donation") {
      for (const d of s.donations) if (d.id === id) { Object.assign(d, { reversed: true, reversalReason: reason }); details = `${d.donorName} · ₹${d.amount}`; }
    } else if (kind === "disbursement") {
      for (const d of s.disbursements) if (d.id === id) { Object.assign(d, { reversed: true, reversalReason: reason }); details = `${d.recipientName} · ₹${d.amount}`; }
    }
    return `${kind}: ${details}`;
  }, { admin, action: "Reversed entry" });
  revalidatePath("/", "layout");
}

export async function addDonationAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = z.object({
      donorName: z.string().trim().max(200),
      amount,
      date,
      paymentMethod: text("Payment method"),
      anonymous: z.boolean(),
    }).parse({
      donorName: form.get("donorName") ?? "",
      amount: form.get("amount"),
      date: form.get("date"),
      paymentMethod: form.get("paymentMethod"),
      anonymous: form.get("anonymous") === "on",
    });
    if (!data.anonymous && !data.donorName) return { ok: false, message: "Donor name is required unless anonymous." };
    await mutate((s) => {
      s.donations.push({ id: newId(), donorName: data.donorName || "Anonymous donor", amount: data.amount, donationDate: data.date, paymentMethod: data.paymentMethod, anonymous: data.anonymous, reversed: false });
      return `${data.donorName || "Anonymous"} · ₹${data.amount}`;
    }, { admin, action: "Recorded donation" });
    return done("Donation recorded.");
  } catch (e) {
    return fail(e);
  }
}

export async function addDisbursementAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = z.object({
      recipientName: text("Recipient"),
      amount,
      date,
      purpose: text("Purpose"),
      paymentMethod: text("Payment method"),
      receiptUrl: z.string().trim().max(500).refine((v) => v === "" || /^(https:\/\/|\/proof\/)/.test(v), "Receipt must be an https link or /proof/ path."),
    }).parse({
      recipientName: form.get("recipientName"),
      amount: form.get("amount"),
      date: form.get("date"),
      purpose: form.get("purpose"),
      paymentMethod: form.get("paymentMethod"),
      receiptUrl: form.get("receiptUrl") ?? "",
    });
    await mutate((s) => {
      s.disbursements.push({ id: newId(), recipientName: data.recipientName, amount: data.amount, disbursementDate: data.date, purpose: data.purpose, paymentMethod: data.paymentMethod, receiptUrl: data.receiptUrl || undefined, reversed: false });
      return `${data.recipientName} · ₹${data.amount}`;
    }, { admin, action: "Recorded disbursement" });
    return done("Disbursement recorded.");
  } catch (e) {
    return fail(e);
  }
}

export async function editMemberAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const id = text("Member").parse(form.get("id"));
    const name = text("Name").parse(form.get("name"));
    await mutate((s) => {
      const m = s.members.find((x) => x.id === id);
      if (!m) throw new Error("Member not found.");
      if (s.members.some((x) => x.id !== id && x.name.toLowerCase() === name.toLowerCase())) throw new Error("A member with this name already exists.");
      const old = m.name;
      m.name = name;
      return `${old} → ${name}`;
    }, { admin, action: "Renamed member" });
    return done("Member updated.");
  } catch (e) {
    return fail(e);
  }
}

export async function editPaymentAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const id = text("Payment").parse(form.get("id"));
    const data = z.object({ amount, date, reference: z.string().trim().max(200) }).parse({
      amount: form.get("amount"),
      date: form.get("date"),
      reference: form.get("reference") ?? "",
    });
    await mutate((s) => {
      for (const m of s.members) {
        const p = m.payments.find((x) => x.id === id);
        if (!p) continue;
        if (p.reversed) throw new Error("Reversed payments cannot be edited.");
        const before = `₹${p.amount} · ${p.date}`;
        Object.assign(p, { amount: data.amount, date: data.date, reference: data.reference || "Cash" });
        return `${m.name}: ${before} → ₹${data.amount} · ${data.date}`;
      }
      throw new Error("Payment not found.");
    }, { admin, action: "Edited payment" });
    return done("Payment updated.");
  } catch (e) {
    return fail(e);
  }
}
