import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ak_admin";
const MAX_AGE = 60 * 60 * 8;

// Demo defaults only; set ADMIN_PASSWORD and AUTH_SECRET in .env.local for real use.
function password() {
  return process.env.ADMIN_PASSWORD || "akadmin123";
}
function secret() {
  return process.env.AUTH_SECRET || "dev-only-secret-change-me";
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function usingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

export async function login(input: string): Promise<boolean> {
  if (!safeEqual(input, password())) return false;
  const expires = Date.now() + MAX_AGE * 1000;
  const jar = await cookies();
  jar.set(COOKIE, `${expires}.${sign(String(expires))}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [expires, sig] = raw.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return safeEqual(sig, sign(expires));
}
