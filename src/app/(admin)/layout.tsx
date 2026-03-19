import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

const adminLinks = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/creators", label: "Creator Applications" },
  { href: "/admin/listings", label: "Listing Reviews" },
  { href: "/admin/disputes", label: "Disputes" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex gap-8">
        <Sidebar links={adminLinks} title="Admin" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </>
  );
}
