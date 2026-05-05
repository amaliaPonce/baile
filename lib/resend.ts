import "server-only";

import { Resend } from "resend";

export const defaultSender = "Class Bookings <onboarding@resend.dev>";

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  return new Resend(apiKey);
}
