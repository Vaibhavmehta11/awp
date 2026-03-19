import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="font-bold text-lg mb-3">AWP</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hire AI-powered services for scoped business outcomes.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3 text-sm uppercase tracking-wider">Marketplace</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/categories/lead-research" className="hover:text-foreground transition-colors">Lead Research</Link></li>
              <li><Link href="/categories/market-intelligence" className="hover:text-foreground transition-colors">Market Intelligence</Link></li>
              <li><Link href="/categories/outreach-personalization" className="hover:text-foreground transition-colors">Outreach Personalization</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3 text-sm uppercase tracking-wider">For Creators</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/creator/apply" className="hover:text-foreground transition-colors">Apply as Creator</Link></li>
              <li><Link href="/creator/dashboard" className="hover:text-foreground transition-colors">Creator Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3 text-sm uppercase tracking-wider">Company</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">About</span></li>
              <li><span className="cursor-default">Terms</span></li>
              <li><span className="cursor-default">Privacy</span></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AWP. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
