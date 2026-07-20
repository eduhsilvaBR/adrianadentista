import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PatientForm from "@/components/PatientForm";
import AttachmentUploadForm from "@/components/patient/AttachmentUploadForm";
import DeleteRecordButton from "@/components/patient/DeleteRecordButton";
import { updatePatient, deletePatient } from "../actions";
import { deleteAttachment, deletePrescription } from "./records-actions";
import { formatDateBR } from "@/lib/utils";

function toDateInput(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function EditarPacientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "dados" } = await searchParams;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      categories: true,
      attachments: { orderBy: { createdAt: "desc" } },
      prescriptions: { orderBy: { createdAt: "desc" }, include: { professional: true } },
    },
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

      <div className="mb-6 flex gap-6 border-b border-gray-200">
        <Tab href={`/pacientes/${id}`} label="Dados do paciente" active={tab === "dados"} />
        <Tab href={`/pacientes/${id}?tab=exames`} label={`Exames e documentos${patient.attachments.length ? ` (${patient.attachments.length})` : ""}`} active={tab === "exames"} />
        <Tab href={`/pacientes/${id}?tab=receitas`} label={`Receitas${patient.prescriptions.length ? ` (${patient.prescriptions.length})` : ""}`} active={tab === "receitas"} />
      </div>

      {tab === "exames" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Exames e documentos</h2>
          <AttachmentUploadForm patientId={id} />

          {patient.attachments.length === 0 ? (
            <p className="mt-6 text-center text-sm text-gray-500">Nenhum arquivo anexado ainda.</p>
          ) : (
            <div className="mt-6 space-y-2">
              {patient.attachments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📎</span>
                    <div>
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-700 hover:underline">
                        {a.name}
                      </a>
                      <p className="text-xs text-gray-500">
                        {a.category} · {formatSize(a.size)} · {formatDateBR(a.createdAt)}
                      </p>
                    </div>
                  </div>
                  <DeleteRecordButton
                    confirmMessage={`Excluir o arquivo "${a.name}"?`}
                    action={deleteAttachment.bind(null, a.id, id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "receitas" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Receitas</h2>
            <Link
              href={`/pacientes/${id}/receitas/novo`}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              + Nova receita
            </Link>
          </div>

          {patient.prescriptions.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">Nenhuma receita gerada ainda.</p>
          ) : (
            <div className="space-y-2">
              {patient.prescriptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <div>
                    <Link href={`/pacientes/${id}/receitas/${r.id}`} className="text-sm font-medium text-brand-700 hover:underline">
                      {r.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {r.professional?.name ?? "Sem dentista"} · {formatDateBR(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/pacientes/${id}/receitas/${r.id}`} className="text-xs font-medium text-gray-500 hover:text-gray-700">
                      Ver / Imprimir
                    </Link>
                    <DeleteRecordButton
                      confirmMessage={`Excluir a receita "${r.title}"?`}
                      action={deletePrescription.bind(null, r.id, id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "dados" && (
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
      )}
    </div>
  );
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 py-3 text-sm font-medium transition-colors ${
        active ? "border-brand-600 text-brand-600" : "border-transparent text-gray-600 hover:text-gray-800"
      }`}
    >
      {label}
    </Link>
  );
}
