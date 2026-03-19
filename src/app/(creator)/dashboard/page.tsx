import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

export default async function CreatorDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      creatorProfile: {
        include: {
          jobs: {
            where: {
              status: { in: ["SUBMITTED", "ACCEPTED", "IN_PROGRESS", "DELIVERED"] },
            },
            include: {
              listing: { select: { title: true, category: true } },
              buyer: { include: { user: { select: { displayName: true } } } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!user) redirect("/sign-in");

  if (!user.creatorProfile) {
    return (
      <EmptyState
        title="You're not a creator yet"
        description="Apply to become an AWP creator and start offering AI-powered services."
      >
        <Button asChild>
          <Link href="/creator/apply">Apply Now</Link>
        </Button>
      </EmptyState>
    );
  }

  const cp = user.creatorProfile;
  const pendingJobs = cp.jobs.filter((j) => j.status === "SUBMITTED").length;
  const activeJobs = cp.jobs.filter((j) => ["ACCEPTED", "IN_PROGRESS"].includes(j.status)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creator Dashboard"
        description={`Welcome back, ${cp.displayName}`}
      >
        {cp.status !== "APPROVED" && (
          <Badge variant="secondary">{cp.status}</Badge>
        )}
      </PageHeader>

      {cp.status !== "APPROVED" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4 text-sm text-yellow-800">
            Your creator account is <strong>{cp.status.toLowerCase()}</strong>.
            {cp.status === "PENDING" && " Your profile is under review — you'll be notified when approved."}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-2xl font-bold">{pendingJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">New orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-2xl font-bold">{activeJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">Active jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-2xl font-bold">{cp.ratingAvg.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg rating ({cp.ratingCount})</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-2xl font-bold">{cp.completionRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Jobs</h2>
        {cp.jobs.length === 0 ? (
          <EmptyState title="No active jobs" description="Jobs will appear here once buyers order your services." />
        ) : (
          <div className="space-y-2">
            {cp.jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/creator/jobs/${job.id}`} className="font-medium text-sm hover:underline">
                      {job.briefTitle}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {job.listing.title} · {job.buyer.user.displayName}
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
    </div>
  );
}
