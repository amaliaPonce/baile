type SetupNoticeProps = {
  missing: string[];
};

export default function SetupNotice({ missing }: SetupNoticeProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
          Configuracion necesaria
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Faltan variables de entorno
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          La app no puede conectarse a Supabase todavía. Crea el archivo
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">
            .env.local
          </code>
          en la raíz del proyecto y añade estas claves:
        </p>

        <div className="mt-6 rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
          <pre className="overflow-x-auto whitespace-pre-wrap">
{`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=`}
          </pre>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-900">Faltan ahora mismo:</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {missing.map((item) => (
              <li key={item} className="rounded-md bg-amber-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Las credenciales públicas salen de Supabase en{" "}
          <span className="font-medium text-slate-900">Settings → API</span>.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Después de guardar el archivo, reinicia el servidor con{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">
            npm run dev
          </code>
          .
        </p>
      </div>
    </main>
  );
}
