import { CreatorApplicationForm } from "@/components/creator/creator-application-form";
import { PageHeader } from "@/components/shared/page-header";

export default function CreatorApplyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Above-the-fold value section */}
      <div className="rounded-xl border bg-gradient-to-b from-muted/50 to-background p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight leading-tight">
          Deliver AI-powered services.{" "}
          <span className="text-primary">Get paid on time. Every time.</span>
        </h1>
        <ul className="space-y-3 text-left max-w-md mx-auto">
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold text-lg leading-tight">✓</span>
            <span className="text-muted-foreground">
              You set the scope. We bring the buyers.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold text-lg leading-tight">✓</span>
            <span className="text-muted-foreground">
              Quality guarantee means serious buyers only.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold text-lg leading-tight">✓</span>
            <span className="text-muted-foreground">
              Get paid within 48 hours of delivery acceptance.
            </span>
          </li>
        </ul>
      </div>

      {/* Application form */}
      <div className="space-y-4">
        <PageHeader
          title="Apply to Become a Creator"
          description="We manually review all applications. We look for strong AI and automation expertise and proven workflow capabilities."
        />
        <CreatorApplicationForm />
      </div>
    </div>
  );
}
