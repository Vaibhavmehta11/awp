import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/marketplace/category-card";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mb-6 bg-background">
            <span className="text-primary mr-1.5">●</span> Curated AI-powered services
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
            Hire AI-Powered Services.{" "}
            <span className="text-primary">Get Real Outcomes.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AWP connects you with vetted AI-powered service creators who deliver
            scoped, measurable results — not hours or effort.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/categories/lead-research">Browse Services</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/creator/apply">Become a Creator</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span>✓ Curated creators only</span>
            <span>✓ Scoped deliverables</span>
            <span>✓ Revision protection</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Browse by Category</h2>
          <p className="mt-3 text-muted-foreground">
            Specialized AI services for your go-to-market stack
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <CategoryCard
            title="Lead Research & List Building"
            description="Get verified, enriched prospect lists built by AI workflows trained on your exact ICP. Delivered as structured spreadsheets or CRM-ready exports."
            href="/categories/lead-research"
            icon="🎯"
          />
          <CategoryCard
            title="Competitor / Market Intelligence"
            description="Deep research reports on competitors, market positioning, pricing signals, and feature gaps — compiled and synthesized by AI agents."
            href="/categories/market-intelligence"
            icon="📊"
          />
          <CategoryCard
            title="Outreach Personalization"
            description="AI-generated, hyper-personalized cold email sequences and LinkedIn messages crafted from prospect context and your value proposition."
            href="/categories/outreach-personalization"
            icon="✉️"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-6">
          <CategoryCard
            title="ICP Definition"
            description="Get a precise 1-page Ideal Customer Profile with sample accounts, firmographic filters, and persona briefs. Delivered as a structured document within 48 hours."
            href="/categories/icp-definition"
            icon="🧭"
          />
          <CategoryCard
            title="Competitor Intelligence"
            description="Deep competitive cards covering positioning, pricing, messaging weaknesses, and differentiation opportunities for up to 5 competitors."
            href="/categories/competitor-intelligence"
            icon="🔍"
          />
          <CategoryCard
            title="ABM Account Research"
            description="10 to 25 deep account profiles with decision makers, tech stack, recent triggers, and personalized talking points. Ready to load into your CRM."
            href="/categories/abm-account-research"
            icon="🏢"
          />
          <CategoryCard
            title="Prospect List Audit"
            description="Clean, enrich, and re-score a decaying list before you send. Deduped, verified, and formatted for your email platform."
            href="/categories/prospect-list-audit"
            icon="🧹"
          />
          <CategoryCard
            title="Intent Signal Monitoring"
            description="Weekly report of 20 to 30 accounts showing active buying signals based on job posts, funding rounds, tech changes, and content activity."
            href="/categories/intent-signal-monitoring"
            icon="📡"
          />
        </div>
      </section>

      <Separator />

      {/* How it works */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">How AWP Works</h2>
            <p className="mt-3 text-muted-foreground">
              Three simple steps to get results
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Browse & Select</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse curated AI services by category. Every listing has a defined deliverable,
                fixed price, and clear turnaround time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Submit Your Brief</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fill out a structured intake form. No back-and-forth — the brief captures
                everything the creator needs to start immediately.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Receive Deliverables</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get structured outputs within the promised timeframe. Request a revision
                if needed, then accept and review.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Trust section */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Curated Creators. Accountable Results.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Every creator on AWP goes through an application and review process.
            Listings are manually reviewed before going live. Performance badges
            are earned — not purchased.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg border bg-card text-center">
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-xs text-muted-foreground mt-1">Vetted creators</p>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <p className="text-2xl font-bold text-primary">Fixed</p>
              <p className="text-xs text-muted-foreground mt-1">Pricing, no surprises</p>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <p className="text-2xl font-bold text-primary">1+</p>
              <p className="text-xs text-muted-foreground mt-1">Revision included</p>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <p className="text-2xl font-bold text-primary">SLA</p>
              <p className="text-xs text-muted-foreground mt-1">Defined turnaround</p>
            </div>
          </div>
          <div className="mt-10">
            <Button size="lg" asChild>
              <Link href="/categories/lead-research">Start Browsing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
