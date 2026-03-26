import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal proxy — no Clerk, just pass through
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/(api|trpc)(.*)"],
};
