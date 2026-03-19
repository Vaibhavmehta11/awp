import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [
    pendingApplications,
    pendingListings,
    openDisputes,
    totalJobs,
    activeJobs,
  ] = await Promise.all([
    prisma.creatorApplication.count({ where: { status: "SUBMITTED" } }),
    prisma.serviceListing.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.disputeCase.count({ where: { status: { in: ["OPEN", "INVESTIGATING"] } } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: { in: ["ACCEPTED", "IN_PROGRESS"] } } }),
  ]);

  const stats = [
    { label: "Pending Applications", value: pendingApplications, alert: pendingApplications > 0 },
    { label: "Listings Awaiting Review", value: pendingListings, alert: pendingListings > 0 },
    { label: "Open Disputes", value: openDisputes, alert: openDisputes > 0 },
    { label: "Total Jobs", value: totalJobs, alert: false },
    { label: "Active Jobs", value: activeJobs, alert: false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" description="Platform health at a glance" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={stat.alert ? "border-yellow-400" : undefined}>
            <CardContent className="pt-5">
              <p className={`text-2xl font-bold ${stat.alert ? "text-yellow-600" : ""}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
