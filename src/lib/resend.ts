import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

export async function sendJobSubmittedEmail(to: string, jobTitle: string, creatorName: string) {
  return resend.emails.send({
    from: "AWP <noreply@awp.dev>",
    to,
    subject: `Your job "${jobTitle}" has been submitted`,
    html: `<p>Hi there,</p><p>Your job <strong>${jobTitle}</strong> has been submitted to <strong>${creatorName}</strong>. You will be notified when they accept it.</p><p>The AWP Team</p>`,
  });
}

export async function sendJobAcceptedEmail(to: string, jobTitle: string) {
  return resend.emails.send({
    from: "AWP <noreply@awp.dev>",
    to,
    subject: `Your job "${jobTitle}" has been accepted`,
    html: `<p>Hi there,</p><p>Great news! Your job <strong>${jobTitle}</strong> has been accepted and work has started.</p><p>The AWP Team</p>`,
  });
}

export async function sendJobDeliveredEmail(to: string, jobTitle: string) {
  return resend.emails.send({
    from: "AWP <noreply@awp.dev>",
    to,
    subject: `Delivery ready: "${jobTitle}"`,
    html: `<p>Hi there,</p><p>Your job <strong>${jobTitle}</strong> has been delivered. Please review and accept or request a revision.</p><p>The AWP Team</p>`,
  });
}

export async function sendCreatorApplicationStatusEmail(
  to: string,
  name: string,
  approved: boolean
) {
  return resend.emails.send({
    from: "AWP <noreply@awp.dev>",
    to,
    subject: approved ? "Your AWP creator application was approved!" : "AWP creator application update",
    html: approved
      ? `<p>Hi ${name},</p><p>Congratulations! Your application to become an AWP creator has been approved. Log in to start building your listings.</p><p>The AWP Team</p>`
      : `<p>Hi ${name},</p><p>Thank you for applying to AWP. Unfortunately your application was not approved at this time. You may reapply after 30 days.</p><p>The AWP Team</p>`,
  });
}
