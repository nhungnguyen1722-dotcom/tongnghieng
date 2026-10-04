import { notFound } from "next/navigation";
import PageEditor from "../../PageEditor";
import { ADMIN_PAGES } from "../../page-data";

export default async function ContentPageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!ADMIN_PAGES.some((page) => page.slug === slug && page.slug !== "trang-chu")) notFound();
  return <PageEditor slug={slug} />;
}
