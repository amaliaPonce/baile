import { NextResponse } from "next/server";

import { sendBookingEmails } from "@/lib/email";
import { emailPayloadSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = emailPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos de email no validos." }, { status: 400 });
    }

    await sendBookingEmails(parsed.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado." },
      { status: 500 },
    );
  }
}
