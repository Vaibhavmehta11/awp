import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function CreatorJobsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) redirect("/creator/apply");

  const jobs = await prisma.job.findMany({
    where: { creatorId: user.creatorProfile.id },
    include: {
      listing: { select: { title: true, category: true } },
      buyer: { include: { user: { select: { displayName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" description="Manage all incoming and active jobs" />

      {jobs.length === 0 ? (
        <EmptyState title="No jobs yet" description="Jobs will appear here when buyers order your services." />
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                <div>
                  <Link
                    href={`/creator/jobs/${job.id}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {job.briefTitle}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job.listing.title} · {job.buyer.user.displayName} · {formatDate(job.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {job.status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {formatCurrency(job.priceAmount.toString(), job.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
