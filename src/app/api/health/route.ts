import { NextResponse } from "next/server";
import { dbPool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { configured: false, connected: false, error: "Chưa cấu hình DATABASE_URL trong .env.local." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const { rows } = await dbPool.query<{ database: string; postgis_version: string | null }>(`
      SELECT current_database() AS database,
        (SELECT extversion FROM pg_extension WHERE extname = 'postgis') AS postgis_version
    `);
    return NextResponse.json(
      { configured: true, connected: true, database: rows[0].database, postgisVersion: rows[0].postgis_version, checkedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("PostGIS health check failed:", error);
    return NextResponse.json(
      { configured: true, connected: false, checkedAt: new Date().toISOString(), error: "Không thể kết nối PostgreSQL. Kiểm tra host, user và mật khẩu." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
