import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/buyer/job-card";
import { BuyerJobListDTO } from "@/types";

export default async function BuyerDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { buyerProfile: true },
  });

  if (!user) redirect("/sign-in");

  // Auto-create buyer profile
  let buyerProfile = user.buyerProfile;
  if (!buyerProfile) {
    buyerProfile = await prisma.buyerProfile.create({
      data: { userId: user.id },
    });
  }

  const jobs = await prisma.job.findMany({
    where: { buyerProfileId: buyerProfile.id },
    include: {
      listing: { select: { title: true, slug: true, category: true } },
      creator: { select: { displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const jobDTOs: BuyerJobListDTO[] = jobs.map((j) => ({
    id: j.id,
    briefTitle: j.briefTitle,
    status: j.status,
    priceAmount: j.priceAmount.toString(),
    currency: j.currency,
    submittedAt: j.submittedAt,
    dueAt: j.dueAt,
    deliveredAt: j.deliveredAt,
    listing: j.listing,
    creator: j.creator,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="My Jobs"
        description="Track all your submitted and active service orders"
      >
        <Button asChild>
          <Link href="/categories/lead-research">Browse Services</Link>
        </Button>
      </PageHeader>

      {jobDTOs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          description="Browse the marketplace and order your first AI-powered service."
        >
          <Button asChild>
            <Link href="/categories/lead-research">Browse Services</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {jobDTOs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
