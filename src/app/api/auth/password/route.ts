import { NextResponse } from "next/server";
import { createSessionToken, hashAccountPassword, hasSameOrigin, readAdminSession, verifyAccountPassword } from "@/lib/admin-auth";
import type { CmsAccount } from "@/lib/cms-data";
import { readCollection, replaceCollection } from "@/lib/cms-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const session = readAdminSession(request);
  if (!session) return NextResponse.json({ error: "Vui lòng đăng nhập lại." }, { status: 401 });
  let body: { currentPassword?: string; newPassword?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Thông tin không hợp lệ." }, { status: 400 }); }
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  if (newPassword.length < 8) return NextResponse.json({ error: "Mật khẩu mới cần có ít nhất 8 ký tự." }, { status: 400 });

  try {
    const accounts = await readCollection("users") as Array<CmsAccount & { passwordHash?: string }>;
    const account = accounts.find((item) => item.id === session.id);
    if (!account || account.status !== "Active" || !verifyAccountPassword(account, currentPassword)) return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác." }, { status: 401 });
    const updated = accounts.map((item) => item.id === account.id ? { ...item, passwordHash: hashAccountPassword(newPassword), passwordChangeRequired: false } : item);
    await replaceCollection("users", updated);
    const response = NextResponse.json({ ok: true, user: { ...session, passwordChangeRequired: false } });
    response.cookies.set("nghieng_admin_session", createSessionToken({ ...account, passwordChangeRequired: false }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60 });
    return response;
  } catch {
    return NextResponse.json({ error: "Không thể lưu mật khẩu mới vào cơ sở dữ liệu." }, { status: 503 });
  }
}
