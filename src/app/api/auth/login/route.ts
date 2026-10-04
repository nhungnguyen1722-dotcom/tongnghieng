import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createSessionToken, hasSameOrigin, verifyAccountPassword } from "@/lib/admin-auth";
import { CMS_SEEDS, type CmsAccount } from "@/lib/cms-data";
import { readCollection } from "@/lib/cms-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Thông tin đăng nhập không hợp lệ." }, { status: 400 }); }
  const email = String(body.email ?? "").trim().toLocaleLowerCase("en-US");
  const password = String(body.password ?? "");
  let accounts: Array<CmsAccount & { passwordHash?: string }> = CMS_SEEDS.users;
  try { accounts = await readCollection("users") as Array<CmsAccount & { passwordHash?: string }>; } catch { /* Seed accounts remain available if the database is offline. */ }
  const account = accounts.find((item) => item.email.toLocaleLowerCase("en-US") === email && item.status === "Active");
  if (!account || !verifyAccountPassword(account, password)) return NextResponse.json({ error: "Email hoặc mật khẩu chưa chính xác." }, { status: 401 });

  try {
    const response = NextResponse.json({ user: { id: account.id, email: account.email, name: account.name, role: account.role, passwordChangeRequired: account.passwordChangeRequired } });
    response.cookies.set(ADMIN_COOKIE, createSessionToken(account), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60 });
    return response;
  } catch {
    return NextResponse.json({ error: "Máy chủ chưa cấu hình khóa phiên quản trị." }, { status: 503 });
  }
}
