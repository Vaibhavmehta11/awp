import {
  BadgeType,
  Category,
  CreatorStatus,
  DisputeStatus,
  JobStatus,
  ListingStatus,
  MessageSenderType,
  UserRole,
} from "@prisma/client";

// ─── Shared primitives ────────────────────────────────────────────────────────

export interface BadgeDTO {
  id: string;
  code: string;
  label: string;
  description: string;
  badgeType: BadgeType;
}

export interface ReviewSummaryDTO {
  id: string;
  rating: number;
  reviewText: string | null;
  createdAt: Date;
  buyerDisplayName?: string;
}

// ─── Marketplace / public ────────────────────────────────────────────────────

export interface CreatorPublicDTO {
  id: string;
  displayName: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  verifiedStatus: boolean;
  ratingAvg: number;
  ratingCount: number;
  completionRate: number;
  onTimeRate: number;
  repeatBuyerRate: number;
  acceptedJobs: number;
  badges: BadgeDTO[];
}

export interface ListingCardDTO {
  id: string;
  title: string;
  slug: string;
  category: Category;
  shortSummary: string;
  turnaroundHours: number;
  priceAmount: string;
  currency: string;
  ratingAvg: number;
  ratingCount: number;
  creator: {
    displayName: string;
    slug: string;
    avatarUrl: string | null;
    verifiedStatus: boolean;
  };
  badges: BadgeDTO[];
}

export interface ListingDetailDTO extends ListingCardDTO {
  description: string;
  deliverableDefinition: string;
  inputSchema: Record<string, unknown> | null;
  outputSchema: Record<string, unknown> | null;
  revisionCountIncluded: number;
  sampleOutputUrls: string[];
  exclusions: string | null;
  completionRate: number;
  onTimeRate: number;
  repeatBuyerRate: number;
  status: ListingStatus;
  recentReviews: ReviewSummaryDTO[];
}

// ─── Buyer DTOs ───────────────────────────────────────────────────────────────

export interface JobRequestInputDTO {
  listingId: string;
  briefTitle: string;
  submittedBrief: Record<string, unknown>;
  attachments?: string[];
  expectedOutputFormat?: string;
}

export interface BuyerJobListDTO {
  id: string;
  briefTitle: string;
  status: JobStatus;
  priceAmount: string;
  currency: string;
  submittedAt: Date;
  dueAt: Date | null;
  deliveredAt: Date | null;
  listing: {
    title: string;
    slug: string;
    category: Category;
  };
  creator: {
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface BuyerJobDetailDTO extends BuyerJobListDTO {
  submittedBrief: Record<string, unknown>;
  attachments: string[];
  expectedOutputFormat: string | null;
  revisionLimit: number;
  revisionCountUsed: number;
  acceptedAt: Date | null;
  buyerClosedAt: Date | null;
  cancelledAt: Date | null;
  deliveries: DeliveryDTO[];
  messages: JobMessageDTO[];
  review: ReviewSummaryDTO | null;
}

export interface DeliveryDTO {
  id: string;
  deliveryVersion: number;
  summaryNote: string | null;
  deliveryPayload: Record<string, unknown>;
  submittedAt: Date;
}

export interface JobMessageDTO {
  id: string;
  senderType: MessageSenderType;
  senderId: string | null;
  messageText: string;
  attachments: string[];
  createdAt: Date;
}

export interface ReviewSubmissionDTO {
  jobId: string;
  rating: number;
  reviewText?: string;
}

// ─── Creator DTOs ─────────────────────────────────────────────────────────────

export interface CreatorDashboardDTO {
  profile: {
    id: string;
    displayName: string;
    slug: string;
    status: CreatorStatus;
    ratingAvg: number;
    completionRate: number;
    onTimeRate: number;
    acceptedJobs: number;
  };
  pendingJobs: number;
  activeJobs: number;
  deliveredThisMonth: number;
  totalEarnings: string;
}

export interface CreatorListingEditDTO {
  id?: string;
  title: string;
  category: Category;
  shortSummary: string;
  description: string;
  deliverableDefinition: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  turnaroundHours: number;
  revisionCountIncluded: number;
  priceAmount: string;
  sampleOutputUrls: string[];
  exclusions?: string;
}

export interface CreatorJobWorkspaceDTO {
  id: string;
  briefTitle: string;
  status: JobStatus;
  submittedBrief: Record<string, unknown>;
  attachments: string[];
  expectedOutputFormat: string | null;
  priceAmount: string;
  currency: string;
  revisionLimit: number;
  revisionCountUsed: number;
  submittedAt: Date;
  acceptedAt: Date | null;
  dueAt: Date | null;
  buyer: {
    displayName: string;
    companyName: string | null;
  };
  listing: {
    title: string;
    category: Category;
  };
  deliveries: DeliveryDTO[];
  messages: JobMessageDTO[];
}

// ─── Admin DTOs ───────────────────────────────────────────────────────────────

export interface AdminCreatorApplicationReviewDTO {
  id: string;
  name: string;
  email: string;
  background: string;
  categoryExpertise: Category[];
  workflowStack: string;
  portfolioLinks: string[];
  sampleWorkLinks: string[];
  status: string;
  reviewNotes: string | null;
  createdAt: Date;
}

export interface AdminPendingListingReviewDTO {
  id: string;
  title: string;
  slug: string;
  category: Category;
  shortSummary: string;
  description: string;
  deliverableDefinition: string;
  turnaroundHours: number;
  priceAmount: string;
  status: ListingStatus;
  createdAt: Date;
  creator: {
    displayName: string;
    slug: string;
    email: string;
  };
}

export interface AdminDisputeCaseDTO {
  id: string;
  reasonCode: string;
  notes: string | null;
  status: DisputeStatus;
  resolutionNotes: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  job: {
    id: string;
    briefTitle: string;
    status: JobStatus;
    priceAmount: string;
    buyer: { displayName: string; email: string };
    creator: { displayName: string; email: string };
  };
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface UserRoleInfo {
  role: UserRole;
  buyerProfileId: string | null;
  creatorProfileId: string | null;
}
