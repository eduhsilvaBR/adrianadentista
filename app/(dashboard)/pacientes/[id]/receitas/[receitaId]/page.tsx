import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PrintButton from "@/components/patient/PrintButton";
import { formatDateBR } from "@/lib/utils";

export default async function ReceitaPage({
  params,
}: {
  params: Promise<{ id: string; receitaId: string }>;
}) {
  const { id, receitaId } = await params;
  const prescription = await prisma.prescription.findUnique({
    where: { id: receitaId },
    include: { patient: true, professional: true },
  });
  if (!prescription || prescription.patientId !== id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/pacientes/${id}?tab=receitas`} className="text-sm font-medium text-gray-600 hover:text-gray-800">
          ← Voltar
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-xl bg-white p-10 shadow-sm print:rounded-none print:shadow-none">
        <div className="mb-8 flex items-start justify-between border-b border-gray-200 pb-6">
          <div>
            <p className="text-xl font-bold text-brand-700">Adriana C. da Silva</p>
            <p className="text-sm text-gray-500">Cirurgiã Dentista</p>
            {prescription.professional && (
              <p className="mt-1 text-sm text-gray-500">
                {prescription.professional.name}
                {prescription.professional.cro ? ` · CRO ${prescription.professional.cro}` : ""}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatDateBR(prescription.createdAt)}</p>
        </div>

        <h1 className="mb-1 text-lg font-semibold text-gray-800">{prescription.title}</h1>
        <p className="mb-6 text-sm text-gray-500">Paciente: {prescription.patient.name}</p>

        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">
          {prescription.content}
        </div>

        <div className="mt-16 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          Documento gerado eletronicamente — {formatDateBR(prescription.createdAt)}
        </div>
      </div>
    </div>
  );
}
