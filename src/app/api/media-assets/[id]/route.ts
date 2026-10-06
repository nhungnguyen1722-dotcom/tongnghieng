import { NextResponse } from "next/server";
import { dbPool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Không tìm thấy ảnh." }, { status: 404 });

  try {
    const { rows } = await dbPool.query<{ mime_type: string; content: Buffer }>("SELECT mime_type, content FROM nghieng_media_assets WHERE id = $1", [id]);
    const asset = rows[0];
    if (!asset) return NextResponse.json({ error: "Không tìm thấy ảnh." }, { status: 404 });
    return new Response(new Uint8Array(asset.content), { headers: { "Content-Type": asset.mime_type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    console.error("Media asset read failed:", error);
    return NextResponse.json({ error: "Không thể đọc ảnh từ cơ sở dữ liệu." }, { status: 503 });
  }
}
