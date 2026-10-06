import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { BRAND_LOGOS, PUBLIC_IMAGES, type CmsLibraryImage, type CmsMedia } from "@/lib/cms-data";
import { readAdminSession } from "@/lib/admin-auth";
import { dbPool } from "@/lib/db";
import { readCollection } from "@/lib/cms-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!readAdminSession(request)) return NextResponse.json({ error: "Cần đăng nhập để xem thư viện." }, { status: 401 });
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  let uploaded: CmsMedia[] = [];
  let databaseAssets: CmsMedia[] = [];
  let galleryAssets: CmsMedia[] = [];

  try {
    const files = await readdir(uploadDirectory);
    uploaded = files
      .filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file))
      .map((file) => ({ id: "upload-" + file, title: file, url: "/uploads/" + file, type: "image" as const, source: "library" as const }));
  } catch {
    uploaded = [];
  }

  try {
    const { rows } = await dbPool.query<{ id: string; file_name: string }>("SELECT id, file_name FROM nghieng_media_assets ORDER BY created_at DESC");
    databaseAssets = rows.map((file) => ({ id: "db-upload-" + file.id, title: file.file_name, url: "/api/media-assets/" + file.id, type: "image", source: "library" }));
  } catch {
    databaseAssets = [];
  }

  try {
    const rows = await readCollection("libraryImages") as CmsLibraryImage[];
    galleryAssets = rows.filter((item) => Boolean(item.url)).map((item) => ({ id: item.id, title: item.title, url: item.url, type: "image", source: "library" }));
  } catch {
    galleryAssets = [];
  }

  const images = PUBLIC_IMAGES.map((url, index) => ({ id: "public-image-" + index, title: "Nghieng Complex – Ảnh " + (index + 1), url, type: "image" as const, source: "external" as const }));
  return NextResponse.json({ items: [...databaseAssets, ...uploaded, ...galleryAssets, ...BRAND_LOGOS, ...images] }, { headers: { "Cache-Control": "no-store" } });
}
