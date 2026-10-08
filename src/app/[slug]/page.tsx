import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ADMIN_PAGES, defaultPageContent, type AdminPageContent, type CulturePageContent } from "../admin/page-data";
import { readCollection } from "@/lib/cms-store";
import type { CmsArticle, CmsPageContent } from "@/lib/cms-data";
import PublicContentPage from "./PublicContentPage";
import TemplateHtmlPage from "./TemplateHtmlPage";
import VanHoaPublicPage from "./VanHoaPublicPage";

export const dynamic = "force-dynamic";

const readPageContents = cache(async () => await readCollection("pageContents") as CmsPageContent[]);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const articleCollection = slug.startsWith("tin-tuc-") ? "news" : slug.startsWith("du-an-") ? "projects" : null;

  if (articleCollection) {
    const prefix = articleCollection === "news" ? "tin-tuc-" : "du-an-";
    const article = (await readCollection(articleCollection) as CmsArticle[]).find((item) => item.slug === slug.slice(prefix.length));
    if (article) {
      return { title: { absolute: article.title }, description: article.summary };
    }
  }

  const record = (await readPageContents()).find((item) => item.slug === slug);
  const content = record?.content as unknown as Partial<AdminPageContent> | undefined;
  const fallback = defaultPageContent(slug);
  const title = content?.seoTitle?.trim() || content?.title || fallback?.seoTitle || fallback?.title;
  const description = content?.seoDescription?.trim() || content?.description || fallback?.seoDescription || fallback?.description;
  const keywords = content?.seoKeywords?.trim() || undefined;

  return {
    ...(title ? { title: { absolute: title } } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
  };
}

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
    const record = (await readPageContents()).find((item) => item.slug === slug);
    if (!record || record.content?.active === false) notFound();
    if (slug === "van-hoa-va-quy-dinh") return <VanHoaPublicPage content={record.content as unknown as CulturePageContent} />;
    const page = record.content as unknown as AdminPageContent;
    return <PublicContentPage key={slug} slug={slug} name={page.name} path={page.path} initialContent={page} />;
  }
  if (templateSlugs.has(slug)) return <TemplateHtmlPage slug={slug} />;
  return <PublicContentPage key={slug} slug={slug} />;
}
