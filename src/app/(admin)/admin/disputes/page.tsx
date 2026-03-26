import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DisputeCard } from "@/components/admin/dispute-card";

export default async function AdminDisputesPage() {
  const disputes = await prisma.disputeCase.findMany({
    where: { status: { in: ["OPEN", "INVESTIGATING"] } },
    include: {
      job: {
        include: {
          buyer: { include: { user: { select: { displayName: true, email: true } } } },
          creator: { include: { user: { select: { displayName: true, email: true } } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disputes"
        description={`${disputes.length} open disputes`}
      />

      {disputes.length === 0 ? (
        <EmptyState title="No open disputes" description="All disputes have been resolved." />
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={{
                id: dispute.id,
                reasonCode: dispute.reasonCode,
                notes: dispute.notes,
                status: dispute.status,
                resolutionNotes: dispute.resolutionNotes,
                createdAt: dispute.createdAt,
                resolvedAt: dispute.resolvedAt,
                job: {
                  id: dispute.job.id,
                  briefTitle: dispute.job.briefTitle,
                  status: dispute.job.status,
                  priceAmount: dispute.job.priceAmount.toString(),
                  buyer: {
                    displayName: dispute.job.buyer.user.displayName,
                    email: dispute.job.buyer.user.email,
                  },
                  creator: {
                    displayName: dispute.job.creator.displayName,
                    email: dispute.job.creator.user.email,
                  },
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
