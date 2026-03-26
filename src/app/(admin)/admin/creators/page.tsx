import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ApplicationReviewCard } from "@/components/admin/application-review-card";

export default async function AdminCreatorsPage() {
  const applications = await prisma.creatorApplication.findMany({
    where: { status: { in: ["SUBMITTED", "REVIEWING"] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creator Applications"
        description={`${applications.length} pending review`}
      />

      {applications.length === 0 ? (
        <EmptyState title="No pending applications" description="All applications have been reviewed." />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationReviewCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
