import { Suspense } from "react";
import AdminAccess from "./AdminAccess";

export default function AdminLoginPage() {
  return <Suspense fallback={<main>Đang tải…</main>}><AdminAccess /></Suspense>;
}
