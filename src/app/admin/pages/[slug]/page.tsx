import { notFound } from "next/navigation";
import PageEditor from "../../PageEditor";
import { ADMIN_PAGES } from "../../page-data";
import CustomPageEditor from "../../CustomPageEditor";
import VanHoaPageEditor from "../../VanHoaPageEditor";
import { readCollection } from "@/lib/cms-store";
import type { CmsPageContent } from "@/lib/cms-data";

export default async function ContentPageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "van-hoa-va-quy-dinh") return <VanHoaPageEditor />;
  if (ADMIN_PAGES.some((page) => page.slug === slug && page.slug !== "trang-chu")) return <PageEditor slug={slug} />;
  const pages = await readCollection("pageContents") as CmsPageContent[];
  if (!pages.some((page) => page.slug === slug)) notFound();
  return <CustomPageEditor slug={slug} />;
}
