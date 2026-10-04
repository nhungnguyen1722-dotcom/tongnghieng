import PublicContentPage from "../../[slug]/PublicContentPage";

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicContentPage slug={`tin-tuc-${slug}`} name="Chi tiết tin tức" path={`/tin-tuc/${slug}`} />;
}
