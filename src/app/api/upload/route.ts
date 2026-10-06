import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { hasSameOrigin, readAdminSession } from "@/lib/admin-auth";
import { dbPool } from "@/lib/db";

export const runtime = "nodejs";

const maxBytes = 12 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  if (!readAdminSession(request)) return NextResponse.json({ error: "Cần đăng nhập để tải ảnh." }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Chọn một tệp ảnh để tải lên." }, { status: 400 });
  if (!extensions[file.type]) return NextResponse.json({ error: "Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc GIF." }, { status: 415 });
  if (file.size > maxBytes) return NextResponse.json({ error: "Dung lượng ảnh tối đa là 12 MB." }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const signatures: Record<string, (data: Buffer) => boolean> = {
    "image/jpeg": (data) => data.length > 2 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff,
    "image/png": (data) => data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    "image/webp": (data) => data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP",
    "image/gif": (data) => data.toString("ascii", 0, 6) === "GIF87a" || data.toString("ascii", 0, 6) === "GIF89a",
  };
  if (!signatures[file.type](bytes)) return NextResponse.json({ error: "Nội dung tệp không khớp định dạng ảnh được chọn." }, { status: 415 });

  const id = randomUUID();
  await dbPool.query("CREATE TABLE IF NOT EXISTS nghieng_media_assets (id UUID PRIMARY KEY, file_name TEXT NOT NULL, mime_type TEXT NOT NULL, content BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  await dbPool.query("INSERT INTO nghieng_media_assets (id, file_name, mime_type, content) VALUES ($1, $2, $3, $4)", [id, file.name, file.type, bytes]);

  return NextResponse.json({ url: "/api/media-assets/" + id, title: file.name }, { status: 201 });
}
