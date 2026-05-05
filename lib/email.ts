import "server-only";

import { defaultSender, getResendClient } from "@/lib/resend";

export type BookingEmailPayload = {
  studentEmail: string;
  studentName: string;
  studentPhone?: string;
  studentDanceStyle?: string;
  studentLevel?: string;
  professorEmail?: string;
  professorName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
};

function emailShell(title: string, body: string) {
  return `
    <div style="background:#f8fafc;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:32px;">${title}</h1>
        <div style="font-size:14px;line-height:22px;color:#334155;">${body}</div>
      </div>
    </div>
  `;
}

export async function sendBookingEmails(payload: BookingEmailPayload) {
  const resend = getResendClient();

  const studentHtml = emailShell(
    "Reserva confirmada",
    `
      <p style="margin:0 0 12px;">Hola ${payload.studentName},</p>
      <p style="margin:0 0 12px;">Tu clase de baile con ${payload.professorName} ha quedado confirmada.</p>
      <p style="margin:0 0 12px;"><strong>Fecha:</strong> ${payload.date}</p>
      <p style="margin:0 0 12px;"><strong>Hora:</strong> ${payload.startTime} - ${payload.endTime}</p>
    `,
  );

  const messages = [
    resend.emails.send({
      from: defaultSender,
      to: payload.studentEmail,
      subject: `Reserva confirmada con ${payload.professorName}`,
      html: studentHtml,
    }),
  ];

  if (payload.professorEmail) {
    const professorHtml = emailShell(
      "Nueva reserva recibida",
      `
        <p style="margin:0 0 12px;">Has recibido una nueva reserva.</p>
        <p style="margin:0 0 12px;"><strong>Alumno:</strong> ${payload.studentName}</p>
        <p style="margin:0 0 12px;"><strong>Telefono:</strong> ${payload.studentPhone || "-"}</p>
        <p style="margin:0 0 12px;"><strong>Email:</strong> ${payload.studentEmail}</p>
        <p style="margin:0 0 12px;"><strong>Estilo:</strong> ${payload.studentDanceStyle || "-"}</p>
        <p style="margin:0 0 12px;"><strong>Nivel:</strong> ${payload.studentLevel || "-"}</p>
        <p style="margin:0 0 12px;"><strong>Fecha:</strong> ${payload.date}</p>
        <p style="margin:0 0 12px;"><strong>Hora:</strong> ${payload.startTime} - ${payload.endTime}</p>
        <p style="margin:0;"><strong>Notas:</strong> ${payload.notes || "Sin notas."}</p>
      `,
    );

    messages.push(
      resend.emails.send({
        from: defaultSender,
        to: payload.professorEmail,
        subject: `Nueva reserva de ${payload.studentName}`,
        html: professorHtml,
      }),
    );
  }

  await Promise.all(messages);
}
