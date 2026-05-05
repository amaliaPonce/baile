import "server-only";

export const PROFESSOR_AUTH_COOKIE = "professor_access";

export function getProfessorPassword() {
  const password = process.env.PROFESSOR_DASHBOARD_PASSWORD;

  if (!password) {
    throw new Error("Falta PROFESSOR_DASHBOARD_PASSWORD.");
  }

  return password;
}
