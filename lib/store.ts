import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { TRUST_CONFIG, type Disbursement, type ExternalDonation, type MemberRecord } from "@/lib/finance";

export interface AppState {
  openingBalance: number;
  members: MemberRecord[];
  donations: ExternalDonation[];
  disbursements: Disbursement[];
  auditLog?: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  at: string;
  admin: string;
  action: string;
  details: string;
}

export const SEED_MEMBERS = [
  "அருணாச்சலம்", "DR.பிரபு", "இசக்கி ராஜா", "அரிநாதன்", "RV.சதிஷ்", "தினேஷ்", "R.மாரிவேல்",
  "ரமேஷ்", "ரவிக்குமார்", "அகிலன்", "ரொகுநாதன்", "குணா", "S.மாரிவேல்", "வினோ", "வெற்றிவேல்",
  "அஜய்", "SV.கதிரவன்", "அபிலன்", "பிரகாஷ்", "செல்வகுமார்", "ராம்குமார்",
];

export function newId(): string {
  return crypto.randomUUID();
}

function seedState(): AppState {
  return {
    openingBalance: TRUST_CONFIG.openingBalance,
    members: SEED_MEMBERS.map((name) => ({
      id: newId(),
      name,
      fundraisingYear: 2026,
      expectedMonthlyContribution: TRUST_CONFIG.monthlyMemberContribution,
      payments: [],
    })),
    donations: [],
    disbursements: [
      {id: "seed-disb-737", recipientName: "Thozhamai Illam", amount: 31000, disbursementDate: "2025-10-06", purpose: "Donation – Receipt No. 737", paymentMethod: "Cash", receiptUrl: "/proof/receipt-2025.png", reversed: false},
      {id: "seed-disb-1163", recipientName: "Thozhamai Illam", amount: 56500, disbursementDate: "2026-10-05", purpose: "Donation – Receipt No. 1163", paymentMethod: "Cash", receiptUrl: "/proof/receipt-2026.png", reversed: false},
    ],
  };
}

const FILE = path.join(process.cwd(), "data", "db.json");

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || key.startsWith("your-")) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// The whole trust (~100 users, a few hundred rows) fits in one JSON document.
// Stored in Supabase (app_state table) when configured, else a local file.
export async function getState(): Promise<AppState> {
  const sb = supabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from("app_state").select("data").eq("id", 1).maybeSingle();
    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    if (data?.data) return data.data as AppState;
    const seeded = seedState();
    await saveState(seeded);
    return seeded;
  }
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as AppState;
  } catch {
    const seeded = seedState();
    await saveState(seeded);
    return seeded;
  }
}

export async function saveState(state: AppState): Promise<void> {
  const sb = supabaseAdmin();
  if (sb) {
    const { error } = await sb.from("app_state").upsert({ id: 1, data: state, updated_at: new Date().toISOString() });
    if (error) throw new Error(`Supabase write failed: ${error.message}`);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(state, null, 2));
}

export async function mutate(fn: (state: AppState) => string | void, audit?: { admin: string; action: string }): Promise<void> {
  const state = await getState();
  const details = fn(state);
  if (audit) {
    state.auditLog = [{ id: newId(), at: new Date().toISOString(), admin: audit.admin, action: audit.action, details: details ?? "" }, ...(state.auditLog ?? [])].slice(0, 500);
  }
  await saveState(state);
}

export function usingSupabase(): boolean {
  return supabaseAdmin() !== null;
}
