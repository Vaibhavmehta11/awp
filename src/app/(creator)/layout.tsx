import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

const creatorLinks = [
  { href: "/creator/dashboard", label: "Dashboard" },
  { href: "/creator/jobs", label: "Jobs" },
  { href: "/creator/listings", label: "Listings" },
];

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });

  if (!user) redirect("/sign-in");

  // Non-approved creators still see the apply page
  const isApplyRoute = true; // allow all creator routes, individual pages guard access

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex gap-8">
        {user.creatorProfile && (
          <Sidebar links={creatorLinks} title="Creator" />
        )}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </>
  );
}
