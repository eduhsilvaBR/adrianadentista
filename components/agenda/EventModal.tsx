"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAppointment,
  createCommitment,
  createTask,
  updateAppointment,
} from "@/app/agenda/actions";
import { combineDateTime, minutesSinceMidnight } from "@/lib/utils";

export type SimplePatient = { id: string; name: string; phone: string | null };
export type SimpleProfessional = { id: string; name: string };
export type SimpleChair = { id: string; name: string };
export type SimpleAppointment = {
  id: string;
  professionalId: string | null;
  chairId: string | null;
  dateISO: string;
  duration: number;
};

const RETURN_OPTIONS = ["Sem retorno", "15 dias", "1 mês", "3 meses", "6 meses", "1 ano"];
const TAG_OPTIONS = ["Nenhuma", "Novo paciente", "Urgente", "Encaixe", "Retorno"];
const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1 block text-sm font-medium text-gray-700";

export default function EventModal({
  onClose,
  professionals,
  chairs,
  appointments,
  defaultProfessionalId,
  prefillDate,
  prefillTime,
  editAppointment,
}: {
  onClose: () => void;
  professionals: SimpleProfessional[];
  chairs: SimpleChair[];
  appointments: SimpleAppointment[];
  defaultProfessionalId?: string;
  prefillDate: string;
  prefillTime: string;
  editAppointment?: {
    id: string;
    patientName: string;
    professionalId: string | null;
    chairId: string | null;
    duration: number;
    notes: string | null;
    returnIn: string | null;
    tag: string | null;
  };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"consulta" | "compromisso" | "tarefa">("consulta");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-5 pb-0">
          <div className="flex gap-1">
            {(["consulta", "compromisso", "tarefa"] as const).map((t) => (
              <button
                key={t}
                type="button"
                disabled={!!editAppointment && t !== "consulta"}
                onClick={() => setTab(t)}
                className={`rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium capitalize transition-colors disabled:opacity-30 ${
                  tab === t
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mb-2 text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {tab === "consulta" && (
            <ConsultaForm
              professionals={professionals}
              chairs={chairs}
              appointments={appointments}
              defaultProfessionalId={defaultProfessionalId}
              prefillDate={prefillDate}
              prefillTime={prefillTime}
              editAppointment={editAppointment}
              submitting={submitting}
              setSubmitting={setSubmitting}
              onDone={() => {
                onClose();
                router.refresh();
              }}
            />
          )}
          {tab === "compromisso" && (
            <CompromissoForm
              professionals={professionals}
              defaultProfessionalId={defaultProfessionalId}
              prefillDate={prefillDate}
              prefillTime={prefillTime}
              submitting={submitting}
              setSubmitting={setSubmitting}
              onDone={() => {
                onClose();
                router.refresh();
              }}
            />
          )}
          {tab === "tarefa" && (
            <TarefaForm
              prefillDate={prefillDate}
              prefillTime={prefillTime}
              submitting={submitting}
              setSubmitting={setSubmitting}
              onDone={() => {
                onClose();
                router.refresh();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PatientPicker({
  onSelect,
  initialLabel,
}: {
  onSelect: (id: string | null) => void;
  initialLabel?: string;
}) {
  const [query, setQuery] = useState(initialLabel ?? "");
  const [results, setResults] = useState<SimplePatient[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/pacientes/search?q=${encodeURIComponent(query)}`);
      setResults(await res.json());
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative" ref={boxRef}>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onSelect(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Busque por nome, telefone ou CPF"
          className={inputCls}
        />
        <a
          href="/pacientes/novo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
        >
          + Cadastrar
        </a>
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setQuery(p.name);
                onSelect(p.id);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              <span className="font-medium text-gray-800">{p.name}</span>
              {p.phone && <span className="ml-2 text-xs text-gray-500">{p.phone}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConsultaForm({
  professionals,
  chairs,
  appointments,
  defaultProfessionalId,
  prefillDate,
  prefillTime,
  editAppointment,
  submitting,
  setSubmitting,
  onDone,
}: {
  professionals: SimpleProfessional[];
  chairs: SimpleChair[];
  appointments: SimpleAppointment[];
  defaultProfessionalId?: string;
  prefillDate: string;
  prefillTime: string;
  editAppointment?: EventModalProps_editAppointment;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  onDone: () => void;
}) {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState(
    editAppointment?.professionalId ?? defaultProfessionalId ?? professionals[0]?.id ?? ""
  );
  const [chairId, setChairId] = useState(editAppointment?.chairId ?? chairs[0]?.id ?? "");
  const [date, setDate] = useState(prefillDate);
  const [time, setTime] = useState(prefillTime);
  const [duration, setDuration] = useState(editAppointment?.duration ?? 30);
  const [error, setError] = useState<string | null>(null);

  function findNextSlot() {
    const dayAppts = appointments
      .filter((a) => a.professionalId === professionalId && a.dateISO.startsWith(date))
      .map((a) => {
        const start = minutesSinceMidnight(new Date(a.dateISO));
        return { start, end: start + a.duration };
      })
      .sort((a, b) => a.start - b.start);

    let cursor = 7 * 60;
    for (const slot of dayAppts) {
      if (cursor + duration <= slot.start) break;
      cursor = Math.max(cursor, slot.end);
    }
    const h = String(Math.floor(cursor / 60)).padStart(2, "0");
    const m = String(cursor % 60).padStart(2, "0");
    setTime(`${h}:${m}`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editAppointment && !patientId) {
      setError("Selecione um paciente na busca.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    if (patientId) fd.set("patientId", patientId);
    try {
      if (editAppointment) {
        await updateAppointment(editAppointment.id, fd);
      } else {
        await createAppointment(fd);
      }
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Dentista</label>
          <select
            name="professionalId"
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            className={inputCls}
          >
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Cadeira</label>
          <select
            name="chairId"
            value={chairId}
            onChange={(e) => setChairId(e.target.value)}
            className={inputCls}
          >
            {chairs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Paciente</label>
        {editAppointment ? (
          <input disabled value={editAppointment.patientName} className={`${inputCls} bg-gray-50 text-gray-500`} />
        ) : (
          <PatientPicker onSelect={setPatientId} />
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Data da consulta</label>
          <input
            type="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Horário</label>
          <input
            type="time"
            name="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Duração</label>
          <div className="flex gap-1">
            <input
              type="number"
              name="duration"
              min={5}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={inputCls}
            />
            <button
              type="button"
              onClick={findNextSlot}
              title="Encontrar horário livre"
              className="shrink-0 rounded-lg border border-brand-200 bg-brand-50 px-2 text-xs font-medium text-brand-700 hover:bg-brand-100"
            >
              🕐
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Observações</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={editAppointment?.notes ?? ""}
          placeholder="Adicione observações sobre esta consulta"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className={labelCls}>Enviar mensagem de confirmação?</span>
          <div className="flex gap-4 pt-1 text-sm text-gray-700">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="sendConfirmation" value="true" defaultChecked className="accent-brand-600" />
              Sim
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="sendConfirmation" value="false" className="accent-brand-600" />
              Não
            </label>
          </div>
        </div>
        <div>
          <label className={labelCls}>Retornar em</label>
          <select name="returnIn" defaultValue={editAppointment?.returnIn ?? "Sem retorno"} className={inputCls}>
            {RETURN_OPTIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Etiqueta</label>
        <select name="tag" defaultValue={editAppointment?.tag ?? "Nenhuma"} className={inputCls}>
          {TAG_OPTIONS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
        >
          ✓ {editAppointment ? "Salvar alterações" : "Agendar consulta"}
        </button>
      </div>
    </form>
  );
}

type EventModalProps_editAppointment = NonNullable<
  Parameters<typeof EventModal>[0]["editAppointment"]
>;

function CompromissoForm({
  professionals,
  defaultProfessionalId,
  prefillDate,
  prefillTime,
  submitting,
  setSubmitting,
  onDone,
}: {
  professionals: SimpleProfessional[];
  defaultProfessionalId?: string;
  prefillDate: string;
  prefillTime: string;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  onDone: () => void;
}) {
  const endTime = useMemo(() => {
    const [h, m] = prefillTime.split(":").map(Number);
    const total = h * 60 + m + 15;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }, [prefillTime]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCommitment(new FormData(e.currentTarget));
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Dentista</label>
        <select name="professionalId" defaultValue={defaultProfessionalId ?? professionals[0]?.id} className={inputCls}>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Título</label>
        <input name="title" required placeholder="Dê um título ao compromisso" className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Data de início</label>
          <input type="date" name="startDate" defaultValue={prefillDate} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Hora de início</label>
          <input type="time" name="startTime" defaultValue={prefillTime} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Data de término</label>
          <input type="date" name="endDate" defaultValue={prefillDate} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Hora de término</label>
          <input type="time" name="endTime" defaultValue={endTime} required className={inputCls} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="repeat" className="h-4 w-4 accent-brand-600" />
        Repetir este compromisso
      </label>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
        >
          ✓ Salvar compromisso
        </button>
      </div>
    </form>
  );
}

function TarefaForm({
  prefillDate,
  prefillTime,
  submitting,
  setSubmitting,
  onDone,
}: {
  prefillDate: string;
  prefillTime: string;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  onDone: () => void;
}) {
  const [patientId, setPatientId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    if (patientId) fd.set("patientId", patientId);
    try {
      await createTask(fd);
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Título *</label>
        <input name="title" required placeholder="Qual tarefa você precisa fazer?" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Descrição</label>
        <textarea name="description" rows={2} placeholder="Adicione detalhes sobre a tarefa..." className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Prazo</label>
          <input type="date" name="dueDate" defaultValue={prefillDate} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>&nbsp;</label>
          <input type="time" name="dueTime" defaultValue={prefillTime} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Lista</label>
          <select name="list" defaultValue="Entrada" className={inputCls}>
            <option>Entrada</option>
            <option>Em andamento</option>
            <option>Concluído</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Paciente</label>
          <PatientPicker onSelect={setPatientId} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
        >
          ✓ Criar tarefa
        </button>
      </div>
    </form>
  );
}
