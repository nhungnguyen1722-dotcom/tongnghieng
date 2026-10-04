import { notFound } from "next/navigation";
import { TourCategoryPage } from "@/components/site/CatalogPages";
import { TourDetailPage } from "@/components/site/DetailPages";
import { getCmsCollection } from "@/lib/cms-server";

export default async function TourRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, tours] = await Promise.all([getCmsCollection("tourCategories"), getCmsCollection("tours")]);
  if (categories.some((item) => item.slug === slug && item.active)) return <TourCategoryPage key={slug} slug={slug} />;
  if (!tours.some((item) => item.slug === slug && item.state === "published")) notFound();
  return <TourDetailPage key={slug} slug={slug} />;
}
