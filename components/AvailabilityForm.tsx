"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Slot = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

type AvailabilityFormProps = {
  initialSlots: Slot[];
  sessionDurationMinutes: number;
};

const days = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" },
  { value: 0, label: "Domingo" },
];

export default function AvailabilityForm({
  initialSlots,
  sessionDurationMinutes,
}: AvailabilityFormProps) {
  const router = useRouter();
  const initialState = useMemo(
    () =>
      days.map((day) => {
        const existing = initialSlots.find(
          (slot) => slot.day_of_week === day.value,
        );

        return {
          day_of_week: day.value,
          label: day.label,
          start_time: existing?.start_time?.slice(0, 5) ?? "09:00",
          end_time: existing?.end_time?.slice(0, 5) ?? "10:00",
          is_active: existing?.is_active ?? false,
        };
      }),
    [initialSlots],
  );

  const [rows, setRows] = useState(initialState);
  const [duration, setDuration] = useState(sessionDurationMinutes);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateRow(index: number, field: keyof (typeof rows)[number], value: string | boolean) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    const response = await fetch("/api/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_duration_minutes: duration,
        slots: rows,
      }),
    });

    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "No se pudo guardar la disponibilidad.");
      return;
    }

    setMessage("Disponibilidad actualizada.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="rounded-[24px] border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Duracion de la clase
          </label>
          <input
            type="number"
            min={15}
            max={240}
            step={15}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-300 px-3 py-3 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
          />
          <p className="mt-2 text-sm text-slate-500">Minutos por franja de clase.</p>
          <div className="mt-6 rounded-2xl bg-slate-950 px-4 py-4 text-sm text-slate-200">
            Activa solo los dias y tramos horarios que quieras mostrar en tu pagina de reservas.
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[1.4fr_0.7fr_1fr_1fr] gap-4 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600">
            <span>Dia</span>
            <span>Activo</span>
            <span>Inicio</span>
            <span>Fin</span>
          </div>
          <div className="divide-y divide-slate-200">
            {rows.map((row, index) => (
              <div
                key={row.day_of_week}
                className="grid grid-cols-[1.4fr_0.7fr_1fr_1fr] items-center gap-4 px-4 py-4 transition hover:bg-slate-50/80"
              >
                <span className="text-sm font-medium text-slate-900">
                  {row.label}
                </span>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={row.is_active}
                    onChange={(event) =>
                      updateRow(index, "is_active", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                </label>
                <input
                  type="time"
                  value={row.start_time}
                  onChange={(event) =>
                    updateRow(index, "start_time", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
                />
                <input
                  type="time"
                  value={row.end_time}
                  onChange={(event) =>
                    updateRow(index, "end_time", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {message ? <p className="text-sm text-green-600">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSaving ? "Guardando..." : "Guardar disponibilidad"}
      </button>
    </form>
  );
}
