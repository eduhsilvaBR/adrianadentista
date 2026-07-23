"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MiniCalendar from "./MiniCalendar";
import EventModal, { SimpleAppointment, SimpleChair, SimpleProfessional } from "./EventModal";
import AppointmentPopover, { PopoverAppointment } from "./AppointmentPopover";
import { addDays, formatHour, MONTHS_BR, toDateKey, WEEKDAYS_BR } from "@/lib/utils";
import { addChair, addProfessional, deleteCommitment, deleteTask, toggleTaskDone } from "@/app/(dashboard)/agenda/actions";

const START_HOUR = 7;
const END_HOUR = 22;
const ROW_HEIGHT = 64;

export type AgendaAppointment = PopoverAppointment & { notes: string | null; returnIn: string | null };
export type AgendaCommitment = { id: string; professionalId: string | null; professionalName: string | null; title: string; startISO: string; endISO: string };
export type AgendaTask = { id: string; title: string; dueISO: string | null; list: string; patientName: string | null; done: boolean };

export default function AgendaCalendar({
  mondayKey,
  selectedKey,
  view,
  chairs,
  professionals,
  appointments,
  commitments,
  tasks,
}: {
  mondayKey: string;
  selectedKey: string;
  view: "semana" | "dia" | "cadeira";
  chairs: SimpleChair[];
  professionals: SimpleProfessional[];
  appointments: AgendaAppointment[];
  commitments: AgendaCommitment[];
  tasks: AgendaTask[];
}) {
  const router = useRouter();
  const [filterChair, setFilterChair] = useState<string>("all");
  const [filterProfessional, setFilterProfessional] = useState<string>("all");
  const [modal, setModal] = useState<{ date: string; time: string; professionalId?: string; chairId?: string } | null>(null);
  const [editAppointmentId, setEditAppointmentId] = useState<string | null>(null);
  const [popover, setPopover] = useState<{ appt: AgendaAppointment; x: number; y: number } | null>(null);
  const [addingChair, setAddingChair] = useState(false);
  const [addingPro, setAddingPro] = useState(false);
  const [nowLabel, setNowLabel] = useState(() => new Date());
  const [chairsOpen, setChairsOpen] = useState(true);
  const [agendasOpen, setAgendasOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setNowLabel(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  function navigate(dateKey: string, nextView = view) {
    router.push(`/agenda?date=${dateKey}&view=${nextView}`);
  }

  function shift(days: number) {
    const base = view === "semana" ? mondayKey : selectedKey;
    navigate(toDateKey(addDays(new Date(`${base}T00:00:00.000Z`), days)));
  }

  const filteredAppointments = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (filterChair === "all" || a.chairName === chairs.find((c) => c.id === filterChair)?.name) &&
          (filterProfessional === "all" || a.professionalName === professionals.find((p) => p.id === filterProfessional)?.name)
      ),
    [appointments, filterChair, filterProfessional, chairs, professionals]
  );

  const filteredCommitments = useMemo(
    () =>
      commitments.filter(
        (c) => filterProfessional === "all" || c.professionalId === filterProfessional
      ),
    [commitments, filterProfessional]
  );

  type Column = { key: string; label: string; sub: string; dateKey: string; chairId?: string; isToday: boolean; isWeekend: boolean };

  const columns: Column[] = useMemo(() => {
    const todayKey = toDateKey(new Date());
    if (view === "cadeira") {
      const list = chairs.length > 0 ? chairs : [{ id: "sem-cadeira", name: "Sem cadeira" }];
      return list.map((c) => ({
        key: c.id,
        label: c.name,
        sub: "",
        dateKey: selectedKey,
        chairId: c.id,
        isToday: selectedKey === todayKey,
        isWeekend: false,
      }));
    }
    if (view === "dia") {
      const d = new Date(`${selectedKey}T00:00:00.000Z`);
      const wd = d.getUTCDay();
      return [{
        key: selectedKey,
        label: WEEKDAYS_BR[wd],
        sub: String(d.getUTCDate()),
        dateKey: selectedKey,
        isToday: selectedKey === todayKey,
        isWeekend: wd === 0 || wd === 6,
      }];
    }
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(new Date(`${mondayKey}T00:00:00.000Z`), i);
      const dateKey = toDateKey(d);
      const wd = d.getUTCDay();
      return {
        key: dateKey,
        label: WEEKDAYS_BR[wd],
        sub: String(d.getUTCDate()),
        dateKey,
        isToday: dateKey === todayKey,
        isWeekend: wd === 0 || wd === 6,
      };
    });
  }, [view, chairs, selectedKey, mondayKey]);

  const headerDate = new Date(`${selectedKey}T00:00:00.000Z`);
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  function minutesOf(iso: string) {
    const d = new Date(iso);
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  }

  function eventsForColumn(col: Column) {
    const appts = filteredAppointments.filter((a) => {
      const sameDay = a.dateISO.startsWith(col.dateKey);
      if (!sameDay) return false;
      if (view === "cadeira") return a.chairName === chairs.find((c) => c.id === col.chairId)?.name;
      return true;
    });
    const comms = filteredCommitments.filter((c) => c.startISO.startsWith(col.dateKey));
    return { appts, comms };
  }

  function handleColumnClick(col: Column, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    let minutes = START_HOUR * 60 + Math.floor(offsetY / ROW_HEIGHT * 60 / 30) * 30;
    minutes = Math.max(START_HOUR * 60, Math.min(minutes, (END_HOUR - 1) * 60 + 30));
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    setModal({
      date: col.dateKey,
      time: `${h}:${m}`,
      professionalId: filterProfessional !== "all" ? filterProfessional : professionals[0]?.id,
      chairId: view === "cadeira" ? col.chairId : filterChair !== "all" ? filterChair : chairs[0]?.id,
    });
  }

  const editingAppt = editAppointmentId ? appointments.find((a) => a.id === editAppointmentId) : null;

  return (
    <div className="mx-auto flex max-w-[1440px] gap-4 px-4 py-6">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 shrink-0 space-y-4">
          <MiniCalendar selectedKey={selectedKey} onSelect={(k) => navigate(k, view === "semana" ? "semana" : view)} />

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <button
              onClick={() => setChairsOpen((v) => !v)}
              className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-gray-800"
            >
              Cadeiras
              <span className={`text-gray-400 transition-transform ${chairsOpen ? "" : "-rotate-90"}`}>▾</span>
            </button>
            {chairsOpen && (
              <>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setFilterChair("all")}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${filterChair === "all" ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${filterChair === "all" ? "bg-brand-500" : "bg-gray-300"}`} />
                    Todas
                  </button>
                  {chairs.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFilterChair(c.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${filterChair === c.id ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${filterChair === c.id ? "bg-brand-500" : "bg-gray-300"}`} />
                      {c.name}
                    </button>
                  ))}
                </div>
                {addingChair ? (
                  <form
                    action={async (fd) => { await addChair(fd); setAddingChair(false); router.refresh(); }}
                    className="mt-2 flex gap-1"
                  >
                    <input name="name" autoFocus placeholder="Nome da cadeira" className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs" />
                    <button type="submit" className="rounded-lg bg-brand-600 px-2 text-xs text-white">OK</button>
                  </form>
                ) : (
                  <button onClick={() => setAddingChair(true)} className="mt-2 text-xs font-medium text-brand-600 hover:underline">
                    + Adicionar cadeira
                  </button>
                )}
              </>
            )}
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <button
              onClick={() => setAgendasOpen((v) => !v)}
              className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-gray-800"
            >
              Agendas
              <span className={`text-gray-400 transition-transform ${agendasOpen ? "" : "-rotate-90"}`}>▾</span>
            </button>
            {agendasOpen && (
              <>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setFilterProfessional("all")}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${filterProfessional === "all" ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${filterProfessional === "all" ? "bg-brand-500" : "bg-gray-300"}`} />
                    Todos
                  </button>
                  {professionals.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFilterProfessional(p.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${filterProfessional === p.id ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${filterProfessional === p.id ? "bg-brand-500" : "bg-gray-300"}`} />
                      {p.name}
                    </button>
                  ))}
                </div>
                {addingPro ? (
                  <form
                    action={async (fd) => { await addProfessional(fd); setAddingPro(false); router.refresh(); }}
                    className="mt-2 space-y-1"
                  >
                    <input name="name" autoFocus placeholder="Nome do profissional" className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs" />
                    <input name="email" placeholder="E-mail (opcional)" className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs" />
                    <button type="submit" className="rounded-lg bg-brand-600 px-2 py-1 text-xs text-white">Adicionar</button>
                  </form>
                ) : (
                  <button onClick={() => setAddingPro(true)} className="mt-2 text-xs font-medium text-brand-600 hover:underline">
                    + Adicionar profissional
                  </button>
                )}
              </>
            )}
          </div>

          {tasks.length > 0 && (
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-gray-800">Tarefas</p>
              <div className="space-y-1.5">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={t.done}
                      onChange={async (e) => { await toggleTaskDone(t.id, e.target.checked); router.refresh(); }}
                      className="mt-0.5 accent-brand-600"
                    />
                    <div className="flex-1">
                      <p className={t.done ? "text-gray-400 line-through" : "text-gray-700"}>{t.title}</p>
                      {t.patientName && <p className="text-xs text-gray-400">{t.patientName}</p>}
                    </div>
                    <button
                      onClick={async () => { await deleteTask(t.id); router.refresh(); }}
                      className="text-xs text-gray-300 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="text-3xl">☁️</p>
            <p className="mt-1 text-sm font-medium text-gray-700">Tem um backup?</p>
            <p className="mt-1 text-xs text-gray-500">
              Se você está vindo de outro sistema ou tem dados em planilhas, nós podemos te ajudar.
            </p>
            <button className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Importar dados
            </button>
          </div>
        </aside>
      )}

      {/* Main calendar */}
      <div className="min-w-0 flex-1 rounded-xl bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Ocultar painel lateral" : "Mostrar painel lateral"}
            className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            {sidebarOpen ? "⟨" : "⟩"}
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {MONTHS_BR[headerDate.getUTCMonth()]} {headerDate.getUTCFullYear()}
          </h1>
          <div className="flex gap-1">
            <button onClick={() => shift(view === "semana" ? -7 : -1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">‹</button>
            <button onClick={() => shift(view === "semana" ? 7 : 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">›</button>
          </div>
          <button onClick={() => navigate(toDateKey(new Date()))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Hoje
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {(["semana", "dia", "cadeira"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => navigate(selectedKey, v)}
                  className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${view === v ? "bg-white text-brand-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={() => window.print()}
              title="Imprimir agenda"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              🖨️
            </button>
          </div>
        </div>

        <div className="relative flex overflow-x-auto">
          {/* Add button */}
          <button
            onClick={() =>
              setModal({
                date: selectedKey,
                time: formatHour(nowLabel).slice(0, 4) + "0",
                professionalId: filterProfessional !== "all" ? filterProfessional : professionals[0]?.id,
                chairId: filterChair !== "all" ? filterChair : chairs[0]?.id,
              })
            }
            className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-lg font-light text-white shadow hover:bg-brand-700"
            title="Novo agendamento"
          >
            +
          </button>

          {/* Hour gutter */}
          <div className="w-14 shrink-0 pt-9">
            {hours.map((h) => (
              <div key={h} style={{ height: ROW_HEIGHT }} className="relative">
                <span className="absolute -top-2 right-2 text-xs text-gray-400">
                  {String(h).padStart(2, "0")}h
                </span>
              </div>
            ))}
          </div>

          {/* Columns */}
          <div className="flex flex-1 min-w-[600px]">
            {columns.map((col) => {
              const { appts, comms } = eventsForColumn(col);
              return (
                <div
                  key={col.key}
                  className={`flex-1 border-l border-gray-100 ${col.isWeekend ? "bg-gray-50/60" : col.isToday ? "bg-brand-50/50" : ""}`}
                >
                  <div className={`sticky top-0 z-[1] border-b border-gray-100 py-2 text-center ${col.isToday ? "bg-brand-50/70" : "bg-white"}`}>
                    <p className={`text-sm font-medium ${col.isToday ? "text-brand-700" : "text-gray-600"}`}>
                      {col.label}
                      {col.sub && (
                        <span className={col.isToday ? "ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white" : "ml-1.5"}>
                          {col.sub}
                        </span>
                      )}
                    </p>
                  </div>
                  <div
                    className="relative cursor-pointer"
                    style={{ height: (END_HOUR - START_HOUR) * ROW_HEIGHT }}
                    onClick={(e) => handleColumnClick(col, e)}
                  >
                    {hours.map((h) => (
                      <div key={h} style={{ height: ROW_HEIGHT }} className="border-b border-gray-50" />
                    ))}

                    {col.isToday && (() => {
                      const mins = nowLabel.getHours() * 60 + nowLabel.getMinutes();
                      if (mins < START_HOUR * 60 || mins > END_HOUR * 60) return null;
                      const top = ((mins - START_HOUR * 60) / 60) * ROW_HEIGHT;
                      return (
                        <div className="pointer-events-none absolute left-0 right-0 z-[2] flex items-center" style={{ top }}>
                          <span className="-ml-1 h-2 w-2 rounded-full bg-orange-500 shadow" />
                          <span className="h-px flex-1 bg-orange-400" />
                        </div>
                      );
                    })()}

                    {comms.map((c) => {
                      const top = ((minutesOf(c.startISO) - START_HOUR * 60) / 60) * ROW_HEIGHT;
                      const height = Math.max(22, ((minutesOf(c.endISO) - minutesOf(c.startISO)) / 60) * ROW_HEIGHT);
                      return (
                        <div
                          key={c.id}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Excluir compromisso "${c.title}"?`)) {
                              await deleteCommitment(c.id);
                              router.refresh();
                            }
                          }}
                          style={{ top, height }}
                          className="absolute left-1 right-1 overflow-hidden rounded-md border-l-[3px] border-amber-400 bg-amber-50 px-2 py-1 text-[11px] text-amber-800 shadow-sm"
                          title="Clique para excluir"
                        >
                          <p className="font-semibold">{formatHour(new Date(c.startISO))} – {formatHour(new Date(c.endISO))}</p>
                          <p className="truncate opacity-90">{c.title}</p>
                        </div>
                      );
                    })}

                    {appts.map((a) => {
                      const top = ((minutesOf(a.dateISO) - START_HOUR * 60) / 60) * ROW_HEIGHT;
                      const height = Math.max(26, (a.duration / 60) * ROW_HEIGHT);
                      const end = new Date(new Date(a.dateISO).getTime() + a.duration * 60000);
                      const colorClass =
                        a.status === "Confirmada"
                          ? "border-brand-500 bg-brand-50 text-brand-800"
                          : a.status === "Cancelada"
                          ? "border-gray-300 bg-gray-50 text-gray-400 line-through"
                          : a.status === "Realizada"
                          ? "border-gray-400 bg-gray-100 text-gray-600"
                          : "border-sky-400 bg-sky-50 text-sky-800";
                      return (
                        <div
                          key={a.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopover({ appt: a, x: e.clientX, y: e.clientY });
                          }}
                          style={{ top, height }}
                          className={`absolute left-1 right-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] shadow-sm transition-shadow hover:shadow-md ${colorClass}`}
                        >
                          <p className="font-semibold">{formatHour(new Date(a.dateISO))} – {formatHour(end)}</p>
                          <p className="truncate font-medium">{a.patientName}</p>
                          {height > 42 && a.chairName && <p className="truncate opacity-70">{a.chairName}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modal && (
        <EventModal
          onClose={() => setModal(null)}
          professionals={professionals}
          chairs={chairs}
          appointments={appointments as unknown as SimpleAppointment[]}
          defaultProfessionalId={modal.professionalId}
          prefillDate={modal.date}
          prefillTime={modal.time}
        />
      )}

      {editingAppt && (
        <EventModal
          onClose={() => setEditAppointmentId(null)}
          professionals={professionals}
          chairs={chairs}
          appointments={appointments as unknown as SimpleAppointment[]}
          prefillDate={editingAppt.dateISO.slice(0, 10)}
          prefillTime={formatHour(new Date(editingAppt.dateISO))}
          editAppointment={{
            id: editingAppt.id,
            patientName: editingAppt.patientName,
            professionalId: professionals.find((p) => p.name === editingAppt.professionalName)?.id ?? null,
            chairId: chairs.find((c) => c.name === editingAppt.chairName)?.id ?? null,
            duration: editingAppt.duration,
            notes: editingAppt.notes,
            returnIn: editingAppt.returnIn,
            tag: editingAppt.tag,
          }}
        />
      )}

      {popover && (
        <AppointmentPopover
          appointment={popover.appt}
          anchor={{ x: popover.x, y: popover.y }}
          onClose={() => setPopover(null)}
          onEdit={() => {
            setEditAppointmentId(popover.appt.id);
            setPopover(null);
          }}
        />
      )}
    </div>
  );
}
