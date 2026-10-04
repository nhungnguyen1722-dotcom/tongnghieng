import { notFound } from "next/navigation";
import AdminCmsManager, { type AdminCmsSection } from "@/components/admin/AdminCmsManager";
import AdminResourcePage from "../AdminResourcePage";
import { RESOURCE_CONFIG } from "../resource-data";

export default async function ResourcePage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!RESOURCE_CONFIG[section]) notFound();
  const cmsSections: AdminCmsSection[] = ["projects", "venues", "venue-categories", "tours", "tour-categories", "news", "media", "library", "menu", "users"];
  if (cmsSections.includes(section as AdminCmsSection)) return <AdminCmsManager section={section as AdminCmsSection} />;
  return <AdminResourcePage section={section} />;
}
