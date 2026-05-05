"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavbarProps = {
  name: string;
  publicSlug: string;
};

const links = [
  { href: "/dashboard", label: "Calendario" },
  { href: "/dashboard/availability", label: "Disponibilidad" },
  { href: "/dashboard/bookings", label: "Reservas" },
];

export default function Navbar({ name, publicSlug }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    document.cookie = "professor_access=; Max-Age=0; path=/";
    router.push("/profesor");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
              Panel del profesor
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-semibold text-slate-950">{name}</p>
              <span className="inline-flex rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
                Gestion de clases
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/book/${publicSlug}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
            >
              Ver pagina publica
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
            >
              Cerrar sesion
            </button>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
