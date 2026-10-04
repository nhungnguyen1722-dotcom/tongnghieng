import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { BRAND_LOGOS, PUBLIC_IMAGES, type CmsMedia } from "@/lib/cms-data";
import { readAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (readAdminSession(request)?.role !== "Admin") return NextResponse.json({ error: "Cần đăng nhập Admin để xem thư viện." }, { status: 401 });
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  let uploaded: CmsMedia[] = [];

  try {
    const files = await readdir(uploadDirectory);
    uploaded = files
      .filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file))
      .map((file) => ({ id: "upload-" + file, title: file, url: "/uploads/" + file, type: "image" as const, source: "library" as const }));
  } catch {
    uploaded = [];
  }

  const images = PUBLIC_IMAGES.map((url, index) => ({ id: "public-image-" + index, title: "Nghieng Complex – Ảnh " + (index + 1), url, type: "image" as const, source: "external" as const }));
  return NextResponse.json({ items: [...uploaded, ...BRAND_LOGOS, ...images] }, { headers: { "Cache-Control": "no-store" } });
}
