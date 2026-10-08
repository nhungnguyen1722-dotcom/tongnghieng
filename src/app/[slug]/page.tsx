import { notFound } from "next/navigation";
import { ADMIN_PAGES, type AdminPageContent, type CulturePageContent } from "../admin/page-data";
import { readCollection } from "@/lib/cms-store";
import type { CmsPageContent } from "@/lib/cms-data";
import PublicContentPage from "./PublicContentPage";
import TemplateHtmlPage from "./TemplateHtmlPage";
import VanHoaPublicPage from "./VanHoaPublicPage";

export const dynamic = "force-dynamic";

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
  if (slug === "trang-chu") notFound();
  const isBuiltInPage = ADMIN_PAGES.some((page) => page.slug === slug);
  if (!isBuiltInPage || slug === "van-hoa-va-quy-dinh") {
    const record = (await readCollection("pageContents") as CmsPageContent[]).find((item) => item.slug === slug);
    if (!record || record.content?.active === false) notFound();
    if (slug === "van-hoa-va-quy-dinh") return <VanHoaPublicPage content={record.content as unknown as CulturePageContent} />;
    const page = record.content as unknown as AdminPageContent;
    return <PublicContentPage key={slug} slug={slug} name={page.name} path={page.path} initialContent={page} />;
  }
  if (templateSlugs.has(slug)) return <TemplateHtmlPage slug={slug} />;
  return <PublicContentPage key={slug} slug={slug} />;
}
