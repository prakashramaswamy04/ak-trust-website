import { TRUST_CONFIG, calculatePublicOverview, calculateMemberStatus, type MemberRecord } from "@/lib/finance";
import type { AppState } from "@/lib/store";

export function currentMonthKey(): string {
  return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 7);
}

export function buildOverview(state: AppState) {
  const base = calculatePublicOverview(state.openingBalance, state.members, state.donations, state.disbursements);
  return {
    ...base,
    totalMembers: state.members.length,
    monthlyTarget: state.members.length * TRUST_CONFIG.monthlyMemberContribution,
  };
}

export function memberRows(members: MemberRecord[], month: string = currentMonthKey()) {
  return members.map((m) => {
    const active = m.payments.filter((p) => !p.reversed);
    const paidThisMonth = active.filter((p) => p.date.startsWith(month)).reduce((t, p) => t + p.amount, 0);
    const paidTotal = active.reduce((t, p) => t + p.amount, 0);
    const expected = m.expectedMonthlyContribution;
    return {
      member: m,
      paidThisMonth,
      paidTotal,
      expected,
      status: calculateMemberStatus(expected, paidThisMonth),
    };
  });
}

// Financial year runs Oct–Sep and is named by the year it ends in (FY 2027 = Oct 2026 – Sep 2027).
export const FIRST_FY = 2027;

export function currentFY(): number {
  const [y, m] = currentMonthKey().split("-").map(Number);
  return m >= 10 ? y + 1 : y;
}

export function fyOptions(): number[] {
  const last = Math.max(FIRST_FY, currentFY());
  return Array.from({ length: last - FIRST_FY + 1 }, (_, i) => FIRST_FY + i);
}

export function parseFY(value: string | undefined): number {
  const n = Number(value);
  return fyOptions().includes(n) ? n : Math.max(FIRST_FY, currentFY());
}

export function monthlySeries(state: AppState, fy: number) {
  const out: { key: string; label: string; members: number; donors: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(fy - 1, 9 + i, 1));
    out.push({
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleString("en-IN", { month: "short", timeZone: "UTC" }),
      members: 0,
      donors: 0,
    });
  }
  const find = (date: string) => out.find((o) => date.startsWith(o.key));
  for (const m of state.members) for (const p of m.payments) if (!p.reversed) { const o = find(p.date); if (o) o.members += p.amount; }
  for (const d of state.donations) if (!d.reversed) { const o = find(d.donationDate); if (o) o.donors += d.amount; }
  return out;
}

export const FIRST_MONTH = "2026-10";

// Months from Oct 2026 up to the current month, newest first.
export function monthOptions(): string[] {
  const out: string[] = [];
  let [y, m] = FIRST_MONTH.split("-").map(Number);
  const now = currentMonthKey();
  for (;;) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (key > now) break;
    out.push(key);
    if (++m > 12) { m = 1; y++; }
  }
  return out.length ? out.reverse() : [FIRST_MONTH];
}

export function parseMonth(value: string | undefined): string {
  const opts = monthOptions();
  return value && opts.includes(value) ? value : opts[0];
}

export function monthLabel(key: string): string {
  return new Date(key + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" });
}
