import { notFound } from "next/navigation";
import { ADMIN_PAGES } from "../admin/page-data";
import PublicContentPage from "./PublicContentPage";

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!ADMIN_PAGES.some((page) => page.slug === slug && page.slug !== "trang-chu")) notFound();
  return <PublicContentPage key={slug} slug={slug} />;
}
