import { z } from "zod";

export const bookingSchema = z.object({
  professor_id: z.string().uuid(),
  student_name: z.string().trim().min(2).max(120),
  student_email: z.string().trim().email(),
  student_phone: z.string().trim().min(7).max(30),
  student_dance_style: z.enum(["salsa", "bachata"]),
  student_level: z.enum(["iniciacion", "intermedio", "avanzado"]),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  date: z.string().date(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
});

export const availabilityItemSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  is_active: z.boolean().default(true),
});

export const availabilityPayloadSchema = z.object({
  session_duration_minutes: z.number().int().min(15).max(240),
  slots: z.array(availabilityItemSchema),
});

export const emailPayloadSchema = z.object({
  studentEmail: z.string().email(),
  studentName: z.string().min(1),
  studentPhone: z.string().optional(),
  studentDanceStyle: z.string().optional(),
  studentLevel: z.string().optional(),
  professorEmail: z.string().email().optional(),
  professorName: z.string().min(1),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
});
