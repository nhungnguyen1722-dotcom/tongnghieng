import { notFound } from "next/navigation";
import AdminCmsManager, { type AdminCmsSection } from "@/components/admin/AdminCmsManager";
import AdminResourcePage from "../AdminResourcePage";
import { RESOURCE_CONFIG } from "../resource-data";

export default async function ResourcePage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const resolvedSection = section === "header-menu" ? "menu" : section;
  if (!RESOURCE_CONFIG[resolvedSection]) notFound();
  const cmsSections: AdminCmsSection[] = ["projects", "venues", "venue-categories", "tours", "tour-categories", "news", "media", "library", "menu", "users"];
  if (cmsSections.includes(resolvedSection as AdminCmsSection)) return <AdminCmsManager section={resolvedSection as AdminCmsSection} />;
  return <AdminResourcePage section={resolvedSection} />;
}
