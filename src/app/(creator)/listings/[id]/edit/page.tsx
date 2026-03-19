import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ListingBuilderForm } from "@/components/creator/listing-builder-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) redirect("/creator/apply");

  const listing = await prisma.serviceListing.findFirst({
    where: { id, creatorId: user.creatorProfile.id },
  });

  if (!listing) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Edit Listing" description={listing.title} />
      <ListingBuilderForm
        mode="edit"
        listing={{
          id: listing.id,
          title: listing.title,
          category: listing.category,
          shortSummary: listing.shortSummary,
          description: listing.description,
          deliverableDefinition: listing.deliverableDefinition,
          turnaroundHours: listing.turnaroundHours,
          revisionCountIncluded: listing.revisionCountIncluded,
          priceAmount: listing.priceAmount.toString(),
          sampleOutputUrls: listing.sampleOutputUrls,
          exclusions: listing.exclusions ?? undefined,
        }}
      />
    </div>
  );
}
