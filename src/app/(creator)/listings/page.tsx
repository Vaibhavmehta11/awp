import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { categoryLabel, formatCurrency } from "@/lib/utils";

export default async function CreatorListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: { include: { listings: { orderBy: { createdAt: "desc" } } } } },
  });

  if (!user?.creatorProfile) redirect("/creator/apply");

  const listings = user.creatorProfile.listings;

  return (
    <div className="space-y-6">
      <PageHeader title="My Listings" description="Manage your service offerings">
        <Button asChild>
          <Link href="/creator/listings/new">+ New Listing</Link>
        </Button>
      </PageHeader>

      {listings.length === 0 ? (
        <EmptyState title="No listings yet" description="Create your first service listing to start accepting orders.">
          <Button asChild>
            <Link href="/creator/listings/new">Create Listing</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">{listing.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {categoryLabel(listing.category)} · {formatCurrency(listing.priceAmount.toString())} · {listing.turnaroundHours}h
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={listing.status === "APPROVED" ? "default" : "secondary"} className="text-xs">
                    {listing.status.replace(/_/g, " ")}
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/creator/listings/${listing.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
