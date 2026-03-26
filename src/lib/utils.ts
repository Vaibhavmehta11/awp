import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatCurrency(amount: number | string, currency = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    LEAD_RESEARCH: "Lead Research & List Building",
    MARKET_INTELLIGENCE: "Competitor / Market Intelligence",
    OUTREACH_PERSONALIZATION: "Outreach Personalization",
    ICP_DEFINITION: "ICP Definition",
    COMPETITOR_INTELLIGENCE: "Competitor Intelligence",
    ABM_ACCOUNT_RESEARCH: "ABM Account Research",
    PROSPECT_LIST_AUDIT: "Prospect List Audit",
    INTENT_SIGNAL_MONITORING: "Intent Signal Monitoring",
  };
  return labels[category] ?? category;
}

