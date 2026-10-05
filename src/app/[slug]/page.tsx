import { notFound } from "next/navigation";
import { ADMIN_PAGES } from "../admin/page-data";
import PublicContentPage from "./PublicContentPage";
import TemplateHtmlPage from "./TemplateHtmlPage";

const templateSlugs = new Set([
  "gioi-thieu",
  "nghieng-travel",
  "khoang-san",
  "cong-nghe-ai",
  "phat-trien-cong-dong",
  "giai-phap-dong-hanh",
  "cong-dong",
  "doi-tac",
  "lien-he",
]);

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!ADMIN_PAGES.some((page) => page.slug === slug && page.slug !== "trang-chu")) notFound();
  if (templateSlugs.has(slug)) return <TemplateHtmlPage slug={slug} />;
  return <PublicContentPage key={slug} slug={slug} />;
}
