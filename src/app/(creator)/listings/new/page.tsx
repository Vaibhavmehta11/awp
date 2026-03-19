import { PageHeader } from "@/components/shared/page-header";
import { ListingBuilderForm } from "@/components/creator/listing-builder-form";

export default function NewListingPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Create New Listing"
        description="Define your service offering. It will be reviewed by the AWP team before going live."
      />
      <ListingBuilderForm mode="create" />
    </div>
  );
}
