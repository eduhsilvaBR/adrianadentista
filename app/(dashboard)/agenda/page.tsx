import { prisma } from "@/lib/prisma";
import AgendaCalendar from "@/components/agenda/AgendaCalendar";
import { addDays, getMonday, toDateKey } from "@/lib/utils";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const params = await searchParams;
  const view = (params.view === "dia" ? params.view : "semana") as "semana" | "dia";
  const selectedKey = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : toDateKey(new Date());
  const selectedDate = new Date(`${selectedKey}T00:00:00.000Z`);
  const monday = getMonday(selectedDate);
  const mondayKey = toDateKey(monday);

  const rangeStart = view === "semana" ? monday : selectedDate;
  const rangeEnd = view === "semana" ? addDays(monday, 7) : addDays(selectedDate, 1);

  const [professionals, appointments, commitments, tasks] = await Promise.all([
    prisma.professional.findMany({ orderBy: { name: "asc" } }),
    prisma.appointment.findMany({
      where: { date: { gte: rangeStart, lt: rangeEnd } },
      include: { patient: { include: { categories: true } }, professional: true },
      orderBy: { date: "asc" },
    }),
    prisma.commitment.findMany({
      where: { start: { gte: rangeStart, lt: rangeEnd } },
      include: { professional: true },
    }),
    prisma.task.findMany({
      where: { done: false, OR: [{ dueDate: null }, { dueDate: { lt: addDays(rangeEnd, 7) } }] },
      include: { patient: true },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
  ]);

  return (
    <AgendaCalendar
      mondayKey={mondayKey}
      selectedKey={selectedKey}
      view={view}
      professionals={professionals.map((p) => ({ id: p.id, name: p.name }))}
      appointments={appointments.map((a) => ({
        id: a.id,
        patientId: a.patientId,
        patientName: a.patient.name,
        patientPhone: a.patient.phone,
        categories: a.patient.categories.map((c) => c.name),
        professionalName: a.professional?.name ?? null,
        dateISO: a.date.toISOString(),
        duration: a.duration,
        status: a.status,
        tag: a.tag,
        notes: a.notes,
        returnIn: a.returnIn,
      }))}
      commitments={commitments.map((c) => ({
        id: c.id,
        professionalId: c.professionalId,
        professionalName: c.professional?.name ?? null,
        title: c.title,
        startISO: c.start.toISOString(),
        endISO: c.end.toISOString(),
      }))}
      tasks={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueISO: t.dueDate ? t.dueDate.toISOString() : null,
        list: t.list,
        patientName: t.patient?.name ?? null,
        done: t.done,
      }))}
    />
  );
}
