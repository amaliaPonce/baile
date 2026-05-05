import { NextResponse } from "next/server";

import {
  getProfessorPassword,
  PROFESSOR_AUTH_COOKIE,
} from "@/lib/professor-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body?.password !== getProfessorPassword()) {
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(PROFESSOR_AUTH_COOKIE, "ok", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado." },
      { status: 500 },
    );
  }
}
