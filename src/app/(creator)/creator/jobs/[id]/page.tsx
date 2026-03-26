import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { JobWorkspace } from "@/components/creator/job-workspace";
import { CreatorJobWorkspaceDTO } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CreatorJobDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) redirect("/creator/apply");

  const job = await prisma.job.findFirst({
    where: { id, creatorId: user.creatorProfile.id },
    include: {
      listing: { select: { title: true, category: true } },
      buyer: { include: { user: { select: { displayName: true, email: true } } } },
      deliveries: { orderBy: { deliveryVersion: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!job) notFound();

  const dto: CreatorJobWorkspaceDTO = {
    id: job.id,
    briefTitle: job.briefTitle,
    status: job.status,
    submittedBrief: job.submittedBrief as Record<string, unknown>,
    attachments: job.attachments,
    expectedOutputFormat: job.expectedOutputFormat,
    priceAmount: job.priceAmount.toString(),
    currency: job.currency,
    revisionLimit: job.revisionLimit,
    revisionCountUsed: job.revisionCountUsed,
    submittedAt: job.submittedAt,
    acceptedAt: job.acceptedAt,
    dueAt: job.dueAt,
    buyer: {
      displayName: job.buyer.user.displayName,
      companyName: job.buyer.companyName,
    },
    listing: job.listing,
    deliveries: job.deliveries.map((d) => ({
      id: d.id,
      deliveryVersion: d.deliveryVersion,
      summaryNote: d.summaryNote,
      deliveryPayload: d.deliveryPayload as Record<string, unknown>,
      submittedAt: d.submittedAt,
    })),
    messages: job.messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      senderId: m.senderId,
      messageText: m.messageText,
      attachments: m.attachments,
      createdAt: m.createdAt,
    })),
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={job.briefTitle}
        description={`${job.listing.title} · ${job.buyer.user.displayName} · ${formatCurrency(job.priceAmount.toString(), job.currency)}`}
      >
        <Badge>{job.status.replace(/_/g, " ")}</Badge>
      </PageHeader>
      <JobWorkspace job={dto} />
    </div>
  );
}
