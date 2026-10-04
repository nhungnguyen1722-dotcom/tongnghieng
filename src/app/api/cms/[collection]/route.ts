import { NextResponse } from "next/server";
import { type CmsAccount, type CmsCollection, type CmsRecord } from "@/lib/cms-data";
import { isCmsCollection, readCollection, removeRecord, replaceCollection } from "@/lib/cms-store";
import { hasSameOrigin, readAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ collection: string }> };

function publicRecords(collection: CmsCollection, items: CmsRecord[]) {
  return items.filter((item) => {
    const record = item as CmsRecord & { active?: boolean; status?: string; state?: string; content?: { active?: boolean } };
    if (collection === "tours" || collection === "venues") return record.state === "published";
    if (collection === "tourCategories" || collection === "venueCategories" || collection === "menu") return record.active !== false;
    if (collection === "news") return record.active !== false && record.status === "published";
    if (collection === "projects") return record.active !== false;
    if (collection === "documents") return record.status === "published";
    return true;
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { collection } = await context.params;
  const session = readAdminSession(_request);
  if (collection === "users" && session?.role !== "Admin") return NextResponse.json({ error: "Cần quyền Admin." }, { status: session ? 403 : 401 });
  if (!isCmsCollection(collection)) return NextResponse.json({ error: "Không tìm thấy danh mục dữ liệu." }, { status: 404 });

  try {
    let items = await readCollection(collection);
    if (session?.role !== "Admin") items = publicRecords(collection, items);
    if (collection === "users") items = items.map((item) => {
      const account = { ...item } as CmsRecord & { passwordHash?: string };
      delete account.passwordHash;
      return account;
    });
    if (collection === "pageContents" && session?.role !== "Admin") items = items.map((item) => {
      const page = item as CmsRecord & { slug: string; content: { active?: boolean }; order: number };
      return page.content?.active === false ? { id: page.id, slug: page.slug, content: { active: false }, order: page.order } : page;
    });
    return NextResponse.json({ items, storage: "postgres" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("CMS read failed:", error);
    return NextResponse.json({ error: "KhÃ´ng thá»ƒ Ä‘á»c dá»¯ liá»‡u CMS tá»« cÆ¡ sá»Ÿ dá»¯ liá»‡u." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { collection } = await context.params;
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const session = readAdminSession(request);
  if (session?.role !== "Admin") return NextResponse.json({ error: "Cần quyền Admin để cập nhật dữ liệu." }, { status: session ? 403 : 401 });
  if (!isCmsCollection(collection)) return NextResponse.json({ error: "Không tìm thấy danh mục dữ liệu." }, { status: 404 });

  try {
    const body = await request.json() as { items?: CmsRecord[] };
    if (!Array.isArray(body.items)) return NextResponse.json({ error: "Dữ liệu cần lưu không hợp lệ." }, { status: 400 });
    let items = body.items;
    if (collection === "users") {
      const existing = await readCollection("users") as Array<CmsAccount & { passwordHash?: string }>;
      const current = existing.find((account) => account.id === session.id);
      const requestedCurrent = body.items.find((account) => account.id === session.id) as CmsAccount | undefined;
      if (!requestedCurrent) return NextResponse.json({ error: "Không thể xóa tài khoản đang đăng nhập." }, { status: 400 });
      if (current && (requestedCurrent.role !== current.role || requestedCurrent.status !== current.status)) return NextResponse.json({ error: "Không thể đổi quyền hoặc trạng thái tài khoản đang đăng nhập." }, { status: 400 });
      items = body.items.map((item) => {
        const previous = existing.find((account) => account.id === item.id);
        const profile = { ...item } as CmsRecord & { passwordHash?: string };
        delete profile.passwordHash;
        return { ...profile, ...(previous?.passwordHash ? { passwordHash: previous.passwordHash } : {}) } as CmsRecord;
      });
      if (!(items as CmsAccount[]).some((account) => account.role === "Admin" && account.status === "Active")) return NextResponse.json({ error: "Cần duy trì ít nhất một tài khoản Admin đang hoạt động." }, { status: 400 });
    }
    const count = await replaceCollection(collection, items);
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    console.error("CMS save failed:", error);
    return NextResponse.json({ error: "Không thể lưu dữ liệu vào cơ sở dữ liệu." }, { status: 503 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { collection } = await context.params;
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const session = readAdminSession(request);
  if (session?.role !== "Admin") return NextResponse.json({ error: "Cần quyền Admin để xóa dữ liệu." }, { status: session ? 403 : 401 });
  if (!isCmsCollection(collection)) return NextResponse.json({ error: "Không tìm thấy danh mục dữ liệu." }, { status: 404 });

  try {
    const { id } = await request.json() as { id?: string };
    if (!id) return NextResponse.json({ error: "Thiếu mã nội dung." }, { status: 400 });
    const deleted = await removeRecord(collection, id);
    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    console.error("CMS delete failed:", error);
    return NextResponse.json({ error: "Không thể xóa nội dung khỏi cơ sở dữ liệu." }, { status: 503 });
  }
}
