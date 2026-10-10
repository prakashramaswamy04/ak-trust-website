import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ak_admin";
const MAX_AGE = 60 * 60 * 8;

// Only two admins; passwords are stored as salted scrypt hashes.
const ADMINS = [
  { username: "superadmin", name: "Sivalingapuram", hash: "a24af00d0522feb349a548311c6a9802:50011a389c492aaa2d9f9d2c3b360aa8f0e2c4adb91e708f247f84e974b23c0d" },
  { username: "ramesh18", name: "Ramesh V", hash: "930d9be136ee65d12833239e617c61fe:c6f994e09470fb980b8f85d9a681e0322e860830564017e97a640dcb6eb7b6f4" },
];
function checkPassword(admin: (typeof ADMINS)[number], input: string) {
  const [salt, hash] = admin.hash.split(":");
  return safeEqual(scryptSync(input, salt, 32).toString("hex"), hash);
}
// Set AUTH_SECRET in .env.local for real use.
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

export async function login(username: string, input: string): Promise<boolean> {
  const admin = ADMINS.find((a) => a.username === username.trim().toLowerCase());
  const ok = admin ? checkPassword(admin, input) : false;
  if (!admin || !ok) return false;
  const expires = Date.now() + MAX_AGE * 1000;
  const payload = `${admin.username}.${expires}`;
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
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

export async function currentAdmin(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [username, expires, sig] = raw.split(".");
  if (!username || !expires || !sig || Number(expires) < Date.now()) return null;
  if (!safeEqual(sig, sign(`${username}.${expires}`))) return null;
  return ADMINS.find((a) => a.username === username)?.name ?? null;
}

export async function isAdmin(): Promise<boolean> {
  return (await currentAdmin()) !== null;
}
