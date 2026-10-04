import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { CmsAccount } from "./cms-data";

export const ADMIN_COOKIE = "nghieng_admin_session";
const initialPasswordHash = "40751fd05e640740102466f8912e3f9ec69b2beeb052b948c82e190786a34eee516a25a08555f5ccc0eece8840858c9e7d7f06048d1bb818a0b6518cc002f3de";

export type AdminSession = Pick<CmsAccount, "id" | "email" | "name" | "role" | "passwordChangeRequired"> & { expiresAt: number };
type AccountWithPassword = CmsAccount & { passwordHash?: string };

function sessionSecret() {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  if (process.env.NODE_ENV !== "production") return process.env.DATABASE_URL || "nghieng-local-development-session-secret";
  return "";
}

export function verifyAccountPassword(account: AccountWithPassword, password: string) {
  if (account.passwordHash) {
    const [salt, expected] = account.passwordHash.split(":");
    if (!salt || !expected || !/^[a-f0-9]{128}$/i.test(expected)) return false;
    const actual = scryptSync(password, salt, 64);
    return timingSafeEqual(actual, Buffer.from(expected, "hex"));
  }
  const actual = scryptSync(password, "nghieng-complex-initial-password-v1", 64);
  return timingSafeEqual(actual, Buffer.from(initialPasswordHash, "hex"));
}

export function hashAccountPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}

export function createSessionToken(account: CmsAccount): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET must be configured in production.");
  const payload: AdminSession = {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    passwordChangeRequired: account.passwordChangeRequired,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return encoded + "." + signature;
}

export function readAdminSession(request: Request): AdminSession | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const cookie = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith(ADMIN_COOKIE + "="));
  if (!cookie) return null;
  let token: string;
  try { token = decodeURIComponent(cookie.slice(ADMIN_COOKIE.length + 1)); } catch { return null; }
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", secret).update(encoded).digest();
  let received: Buffer;
  try { received = Buffer.from(signature, "base64url"); } catch { return null; }
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSession;
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}
