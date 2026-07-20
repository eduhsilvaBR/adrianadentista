import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PatientForm from "@/components/PatientForm";
import { updatePatient, deletePatient } from "../actions";

function toDateInput(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { categories: true },
  });
  if (!patient) notFound();

  const update = updatePatient.bind(null, patient.id);
  const remove = deletePatient.bind(null, patient.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
        <form action={remove}>
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Excluir paciente
          </button>
        </form>
      </div>
      <PatientForm
        action={update}
        submitLabel="Salvar alterações"
        initial={{
          ...patient,
          birthDate: toDateInput(patient.birthDate),
          guardianBirthDate: toDateInput(patient.guardianBirthDate),
          categories: patient.categories.map((c) => c.name).join(", "),
        }}
      />
    </div>
  );
}
