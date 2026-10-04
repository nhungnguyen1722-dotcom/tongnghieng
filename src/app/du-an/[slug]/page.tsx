import PublicContentPage from "../../[slug]/PublicContentPage";

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicContentPage slug={`du-an-${slug}`} name="Chi tiết dự án" path={`/du-an/${slug}`} />;
}
