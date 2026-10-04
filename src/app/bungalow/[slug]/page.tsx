import { notFound } from "next/navigation";
import { VenueDetailPage } from "@/components/site/DetailPages";
import { getCmsCollection } from "@/lib/cms-server";

export default async function BungalowDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venues = await getCmsCollection("venues");
  if (!venues.some((item) => item.slug === slug && item.kind === "bungalow" && item.state === "published")) notFound();
  return <VenueDetailPage key={slug} slug={slug} kind="bungalow" />;
}
