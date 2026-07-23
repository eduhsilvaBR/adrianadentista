"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAppointment, updateAppointmentStatus } from "@/app/(dashboard)/agenda/actions";
import { formatDateBR, formatHour, whatsappLink } from "@/lib/utils";

export type PopoverAppointment = {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  categories: string[];
  professionalName: string | null;
  chairName: string | null;
  dateISO: string;
  duration: number;
  status: string;
  tag: string | null;
};

const STATUS_OPTIONS = ["Agendada", "Confirmada", "Realizada", "Não compareceu", "Cancelada"];

export default function AppointmentPopover({
  appointment,
  anchor,
  onClose,
  onEdit,
}: {
  appointment: PopoverAppointment;
  anchor: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(appointment.status);
  const date = new Date(appointment.dateISO);
  const wa = whatsappLink(appointment.patientPhone, `Olá, ${appointment.patientName.split(" ")[0]}! Confirmando sua consulta.`);

  const left = Math.min(anchor.x, typeof window !== "undefined" ? window.innerWidth - 340 : anchor.x);
  const top = Math.min(anchor.y, typeof window !== "undefined" ? window.innerHeight - 420 : anchor.y);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute w-80 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-gray-200"
        style={{ left: Math.max(8, left), top: Math.max(8, top) }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
              {appointment.patientName.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{appointment.patientName}</p>
              {appointment.patientPhone && (
                <p className="text-xs text-gray-500">{appointment.patientPhone}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-lg leading-none text-gray-400 hover:text-gray-600">×</button>
        </div>

        {appointment.categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {appointment.categories.map((c) => (
              <span key={c} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {c}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <a
            href={`/pacientes/${appointment.patientId}`}
            className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Abrir prontuário
          </a>
          <a
            href={`/pacientes/${appointment.patientId}`}
            className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Adicionar evolução
          </a>
        </div>

        <button
          onClick={onEdit}
          className="mt-2 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Editar agendamento
        </button>

        <div className="mt-3 space-y-1.5 text-xs text-gray-600">
          {appointment.professionalName && <p>👤 {appointment.professionalName}</p>}
          <p>📅 {formatDateBR(date)} · 🕐 {formatHour(date)} ({appointment.duration} min)</p>
          {appointment.chairName && <p>🪑 {appointment.chairName}</p>}
          {appointment.tag && appointment.tag !== "Nenhuma" && (
            <p className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> {appointment.tag}
            </p>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-block text-brand-600 hover:underline">
              🟢 Confirmar via WhatsApp
            </a>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <select
            value={status}
            onChange={async (e) => {
              const value = e.target.value;
              setStatus(value);
              await updateAppointmentStatus(appointment.id, value);
              router.refresh();
            }}
            className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={async () => {
              if (!confirm("Excluir este agendamento?")) return;
              await deleteAppointment(appointment.id);
              onClose();
              router.refresh();
            }}
            className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
