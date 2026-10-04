import { NextResponse } from "next/server";
import { readAdminSession } from "@/lib/admin-auth";

export async function GET(request: Request) {
  return NextResponse.json({ user: readAdminSession(request) });
}
