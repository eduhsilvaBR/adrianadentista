"use server";

import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export async function uploadAttachment(patientId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecione um arquivo para enviar.");
  }

  const blob = await put(`pacientes/${patientId}/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await prisma.attachment.create({
    data: {
      patientId,
      name: file.name,
      url: blob.url,
      size: file.size,
      mimeType: file.type || null,
      category: str(formData, "category") ?? "Exame",
    },
  });

  revalidatePath(`/pacientes/${patientId}`);
}

export async function deleteAttachment(id: string, patientId: string) {
  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (attachment) {
    await del(attachment.url).catch(() => {});
    await prisma.attachment.delete({ where: { id } });
  }
  revalidatePath(`/pacientes/${patientId}`);
}

export async function createPrescription(patientId: string, formData: FormData) {
  const content = str(formData, "content");
  if (!content) throw new Error("O conteúdo da receita é obrigatório.");

  const prescription = await prisma.prescription.create({
    data: {
      patientId,
      professionalId: str(formData, "professionalId"),
      title: str(formData, "title") ?? "Receita",
      content,
    },
  });

  revalidatePath(`/pacientes/${patientId}`);
  redirect(`/pacientes/${patientId}/receitas/${prescription.id}`);
}

export async function deletePrescription(id: string, patientId: string) {
  await prisma.prescription.delete({ where: { id } });
  revalidatePath(`/pacientes/${patientId}`);
}
