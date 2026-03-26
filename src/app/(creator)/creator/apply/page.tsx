import { CreatorApplicationForm } from "@/components/creator/creator-application-form";
import { PageHeader } from "@/components/shared/page-header";

export default function CreatorApplyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Apply to Become a Creator"
        description="AWP manually reviews all creator applications. We look for strong AI/automation expertise and proven workflow capabilities."
      />
      <CreatorApplicationForm />
    </div>
  );
}
