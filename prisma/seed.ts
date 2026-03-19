import { PrismaClient, BadgeType, Category, UserRole, CreatorStatus, ListingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AWP database...");

  // ─── Badges ──────────────────────────────────────────────────────────────────
  const verifiedBadge = await prisma.badge.upsert({
    where: { code: "verified_creator" },
    update: {},
    create: {
      code: "verified_creator",
      label: "Verified Creator",
      description: "This creator has been manually vetted by the AWP team.",
      badgeType: BadgeType.TRUST,
    },
  });

  const topPerformerBadge = await prisma.badge.upsert({
    where: { code: "top_performer" },
    update: {},
    create: {
      code: "top_performer",
      label: "Top Performer",
      description: "Consistently delivers high-rated, on-time work.",
      badgeType: BadgeType.PERFORMANCE,
    },
  });

  const fastTurnaroundBadge = await prisma.badge.upsert({
    where: { code: "fast_turnaround" },
    update: {},
    create: {
      code: "fast_turnaround",
      label: "Fast Turnaround",
      description: "Delivers ahead of schedule 90%+ of the time.",
      badgeType: BadgeType.PERFORMANCE,
    },
  });

  console.log("✓ Badges created");

  // ─── Creator applications ─────────────────────────────────────────────────
  await prisma.creatorApplication.upsert({
    where: { id: "seed_app_1" },
    update: {},
    create: {
      id: "seed_app_1",
      name: "Jordan Martinez",
      email: "jordan@example.com",
      background:
        "5 years in B2B SaaS sales operations. Built multiple Clay + Apollo lead research workflows for Fortune 500 companies. Deep expertise in ICP definition and list segmentation.",
      categoryExpertise: [Category.LEAD_RESEARCH, Category.OUTREACH_PERSONALIZATION],
      workflowStack: "Clay, Apollo, Apify, OpenAI, n8n, Google Sheets",
      portfolioLinks: ["https://www.linkedin.com/in/jordan-example"],
      sampleWorkLinks: ["https://docs.google.com/spreadsheets/d/example"],
      status: "SUBMITTED",
    },
  });

  await prisma.creatorApplication.upsert({
    where: { id: "seed_app_2" },
    update: {},
    create: {
      id: "seed_app_2",
      name: "Priya Nair",
      email: "priya@example.com",
      background:
        "Competitive intelligence analyst with 4 years at a market research firm. Built automated competitor monitoring systems using Apify, Perplexity, and Claude API. Published research on SaaS pricing intelligence.",
      categoryExpertise: [Category.MARKET_INTELLIGENCE],
      workflowStack: "Apify, Claude API, Perplexity, Make, Notion, Airtable",
      portfolioLinks: ["https://priya-example.substack.com"],
      sampleWorkLinks: [],
      status: "SUBMITTED",
    },
  });

  console.log("✓ Creator applications created");

  // ─── Seed creator + listings ──────────────────────────────────────────────
  const creatorUser = await prisma.user.upsert({
    where: { email: "alex@awp-seed.dev" },
    update: {},
    create: {
      clerkId: "seed_clerk_alex",
      email: "alex@awp-seed.dev",
      displayName: "Alex Chen",
      role: UserRole.CREATOR,
    },
  });

  const creatorProfile = await prisma.creatorProfile.upsert({
    where: { userId: creatorUser.id },
    update: {},
    create: {
      userId: creatorUser.id,
      displayName: "Alex Chen",
      slug: "alex-chen",
      bio:
        "AI-powered B2B lead research specialist. I've built and iterated on Clay + Apollo workflows for 3 years, delivering clean, enriched prospect lists for SaaS startups.",
      location: "San Francisco, CA",
      websiteUrl: "https://alexchen-example.com",
      status: CreatorStatus.APPROVED,
      verifiedStatus: true,
      ratingAvg: 4.9,
      ratingCount: 47,
      completionRate: 96,
      onTimeRate: 94,
      repeatBuyerRate: 68,
      acceptedJobs: 51,
    },
  });

  // Assign badges to creator
  await prisma.creatorBadge.upsert({
    where: { creatorId_badgeId: { creatorId: creatorProfile.id, badgeId: verifiedBadge.id } },
    update: {},
    create: { creatorId: creatorProfile.id, badgeId: verifiedBadge.id },
  });
  await prisma.creatorBadge.upsert({
    where: { creatorId_badgeId: { creatorId: creatorProfile.id, badgeId: topPerformerBadge.id } },
    update: {},
    create: { creatorId: creatorProfile.id, badgeId: topPerformerBadge.id },
  });

  console.log("✓ Creator profile created");

  // ─── Listing 1: Lead Research ─────────────────────────────────────────────
  const listing1 = await prisma.serviceListing.upsert({
    where: { slug: "100-verified-b2b-leads-icp" },
    update: {},
    create: {
      creatorId: creatorProfile.id,
      title: "100 Verified B2B Leads for Your Exact ICP",
      slug: "100-verified-b2b-leads-icp",
      category: Category.LEAD_RESEARCH,
      shortSummary:
        "Get 100 enriched, verified B2B prospect records built around your ICP definition.",
      description: `I build precision B2B lead lists using Clay, Apollo, and Apify — enriched with verified emails, LinkedIn URLs, company size, tech stack signals, and recent hiring activity.

You submit a detailed ICP brief (title, company size, industry, geography, intent signals). I run the research, de-duplicate against your existing lists if provided, verify email deliverability, and deliver a clean spreadsheet.

This is not a database export — every record is built from intent and current signal data.`,
      deliverableDefinition:
        "A Google Sheet (or CSV on request) with 100 rows, each containing: First Name, Last Name, Title, Company, LinkedIn URL, Verified Email, Company Size, Industry, Location, and 1 custom intent signal column.",
      turnaroundHours: 48,
      revisionCountIncluded: 1,
      priceAmount: 149,
      currency: "USD",
      sampleOutputUrls: [],
      exclusions:
        "Consumer/B2C contacts, personal email addresses, contacts without LinkedIn profiles, companies outside the agreed geography.",
      status: ListingStatus.APPROVED,
      ratingAvg: 4.9,
      ratingCount: 31,
      completionRate: 97,
      onTimeRate: 95,
    },
  });

  // Assign badges to listing
  await prisma.listingBadge.upsert({
    where: { listingId_badgeId: { listingId: listing1.id, badgeId: verifiedBadge.id } },
    update: {},
    create: { listingId: listing1.id, badgeId: verifiedBadge.id },
  });
  await prisma.listingBadge.upsert({
    where: { listingId_badgeId: { listingId: listing1.id, badgeId: topPerformerBadge.id } },
    update: {},
    create: { listingId: listing1.id, badgeId: topPerformerBadge.id },
  });

  // ─── Listing 2: Outreach Personalization ─────────────────────────────────
  const listing2 = await prisma.serviceListing.upsert({
    where: { slug: "personalized-cold-email-sequences-50" },
    update: {},
    create: {
      creatorId: creatorProfile.id,
      title: "50 Hyper-Personalized Cold Email Sequences",
      slug: "personalized-cold-email-sequences-50",
      category: Category.OUTREACH_PERSONALIZATION,
      shortSummary:
        "AI-researched, human-quality cold email sequences personalized to each prospect's context.",
      description: `Each email sequence is researched and written using a multi-step AI pipeline: I scrape the prospect's LinkedIn, recent company news, job postings, and any provided context — then generate a 3-email sequence that opens with a genuine observation, pivots to your value prop, and closes with a clear CTA.

No templates. No mail-merge personalization tokens. Each sequence reads like it was written by a thoughtful SDR who spent 10 minutes on that prospect.`,
      deliverableDefinition:
        "A Google Sheet with 50 rows. Each row contains: Prospect Name, Company, Email 1 (Subject + Body), Email 2 (Follow-up), Email 3 (Final bump). Formatted for direct import into Instantly, Smartlead, or Apollo sequences.",
      turnaroundHours: 72,
      revisionCountIncluded: 2,
      priceAmount: 299,
      currency: "USD",
      sampleOutputUrls: [],
      exclusions:
        "LinkedIn InMail copy, SMS scripts, sequences longer than 3 emails, prospects without publicly available context.",
      status: ListingStatus.APPROVED,
      ratingAvg: 4.8,
      ratingCount: 16,
      completionRate: 94,
      onTimeRate: 91,
    },
  });

  await prisma.listingBadge.upsert({
    where: { listingId_badgeId: { listingId: listing2.id, badgeId: verifiedBadge.id } },
    update: {},
    create: { listingId: listing2.id, badgeId: verifiedBadge.id },
  });
  await prisma.listingBadge.upsert({
    where: { listingId_badgeId: { listingId: listing2.id, badgeId: fastTurnaroundBadge.id } },
    update: {},
    create: { listingId: listing2.id, badgeId: fastTurnaroundBadge.id },
  });

  console.log("✓ Listings created");
  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
