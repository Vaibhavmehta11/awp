import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<{ session_id?: string; payment?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { session_id, payment } = await searchParams;

  if (payment !== "success" || !session_id) {
    redirect("/buyer/jobs");
  }

  // Find the job linked to this Stripe session
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { buyerProfile: true },
  });

  let job = null;

  if (user?.buyerProfile && session_id) {
    job = await prisma.job.findFirst({
      where: {
        buyerProfileId: user.buyerProfile.id,
        stripeSessionId: session_id,
      },
      include: {
        listing: { select: { title: true } },
      },
    });
  }

  return (
    <div className="max-w-lg mx-auto mt-16 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <p className="text-muted-foreground mt-2">
            Your job has been submitted and payment confirmed. The creator will be notified.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {job && (
            <div className="bg-muted rounded-md p-4 text-sm space-y-1">
              <p className="font-medium">{job.briefTitle}</p>
              <p className="text-muted-foreground">{job.listing.title}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {job ? (
              <Button asChild className="w-full">
                <Link href={`/buyer/jobs/${job.id}`}>View Job Details</Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild className="w-full">
              <Link href="/buyer/jobs">View All Jobs</Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            If you don&apos;t see your job immediately, it may take a few seconds to confirm. Refresh the page or check your jobs list.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
