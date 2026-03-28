import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder", {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export async function createCheckoutSession({
  listingId,
  listingSlug,
  listingTitle,
  priceAmountCents,
  currency,
  creatorId,
  buyerClerkId,
  appUrl,
}: {
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  priceAmountCents: number;
  currency: string;
  creatorId: string;
  buyerClerkId: string;
  appUrl: string;
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: priceAmountCents,
          product_data: {
            name: listingTitle,
            description: "AWP Service Order",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/buyer/jobs/pending?session_id={CHECKOUT_SESSION_ID}&payment=success`,
    cancel_url: `${appUrl}/listings/${listingSlug}?payment=cancelled`,
    metadata: {
      listingId,
      listingSlug,
      creatorId,
      buyerClerkId,
    },
    payment_intent_data: {
      metadata: {
        listingId,
        creatorId,
        buyerClerkId,
      },
    },
  });
}
