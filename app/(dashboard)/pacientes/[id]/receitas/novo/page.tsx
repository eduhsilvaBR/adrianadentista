import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createPrescription } from "../../records-actions";

export default async function NovaReceitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) notFound();

  const professionals = await prisma.professional.findMany({ orderBy: { name: "asc" } });
  const create = createPrescription.bind(null, id);

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
  const labelCls = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-800">Nova receita</h1>
      <p className="mb-6 text-sm text-gray-500">Paciente: {patient.name}</p>

      <form action={create} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Dentista</label>
            <select name="professionalId" className={inputCls} defaultValue={professionals[0]?.id ?? ""}>
              <option value="">Selecionar</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Título</label>
            <input name="title" defaultValue="Receita" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Conteúdo da receita</label>
          <textarea
            name="content"
            required
            rows={12}
            placeholder={"Ex.:\nAmoxicilina 500mg — 1 cápsula de 8/8h por 7 dias\nNimesulida 100mg — 1 comprimido de 12/12h por 3 dias, se dor"}
            className={inputCls}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <a
            href={`/pacientes/${id}?tab=receitas`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </a>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            ✓ Gerar receita
          </button>
        </div>
      </form>
    </div>
  );
}
