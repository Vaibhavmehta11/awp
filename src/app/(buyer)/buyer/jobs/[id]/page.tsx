import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { JobStatusTimeline } from "@/components/buyer/job-status-timeline";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeliveryActions } from "@/components/buyer/delivery-actions";
import { CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function BuyerJobDetailPage({ params, searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const { payment } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { buyerProfile: true },
  });
  if (!user?.buyerProfile) redirect("/dashboard");

  const job = await prisma.job.findFirst({
    where: { id, buyerProfileId: user.buyerProfile.id },
    include: {
      listing: true,
      creator: true,
      deliveries: { orderBy: { deliveryVersion: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
      reviews: true,
    },
  });

  if (!job) notFound();

  const latestDelivery = job.deliveries[0] ?? null;
  const paymentSuccess = payment === "success";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Payment success banner */}
      {paymentSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
          <div>
            <p className="font-medium text-sm">Payment confirmed!</p>
            <p className="text-xs text-green-700">Your job has been submitted. The creator will review and accept shortly.</p>
          </div>
        </div>
      )}

      <PageHeader
        title={job.briefTitle}
        description={`${job.listing.title} · ${formatCurrency(job.priceAmount.toString(), job.currency)}`}
      >
        <Badge>{job.status.replace(/_/g, " ")}</Badge>
        {job.paymentStatus === "paid" && (
          <Badge variant="outline" className="text-green-700 border-green-300">
            Paid
          </Badge>
        )}
      </PageHeader>

      <JobStatusTimeline status={job.status} />

      {/* Delivery + actions */}
      {latestDelivery && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Delivery v{latestDelivery.deliveryVersion}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestDelivery.summaryNote && (
              <p className="text-sm">{latestDelivery.summaryNote}</p>
            )}
            <pre className="text-xs bg-muted rounded-md p-3 overflow-auto max-h-60">
              {JSON.stringify(latestDelivery.deliveryPayload, null, 2)}
            </pre>
            <DeliveryActions
              jobId={job.id}
              status={job.status}
              revisionCountUsed={job.revisionCountUsed}
              revisionLimit={job.revisionLimit}
              hasReview={job.reviews.length > 0}
            />
          </CardContent>
        </Card>
      )}

      {/* Brief */}
      <Card>
        <CardHeader><CardTitle className="text-base">Submitted Brief</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted rounded-md p-3 overflow-auto max-h-60">
            {JSON.stringify(job.submittedBrief, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Messages */}
      {job.messages.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Messages</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {job.messages.map((msg) => (
                <div key={msg.id} className="text-sm border-l-2 pl-3 border-muted">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {msg.senderType} · {formatDate(msg.createdAt)}
                  </p>
                  <p>{msg.messageText}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Submitted {formatDate(job.submittedAt)}</p>
        {job.dueAt && <p>Due {formatDate(job.dueAt)}</p>}
        {job.deliveredAt && <p>Delivered {formatDate(job.deliveredAt)}</p>}
      </div>
    </div>
  );
}
