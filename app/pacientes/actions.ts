"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function date(formData: FormData, key: string): Date | null {
  const v = str(formData, key);
  if (!v) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}

function parseCategories(formData: FormData): string[] {
  return (str(formData, "categories") ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function patientData(formData: FormData) {
  return {
    name: str(formData, "name") ?? "",
    phone: str(formData, "phone"),
    reminderVia: str(formData, "reminderVia") ?? "WhatsApp",
    email: str(formData, "email"),
    landline: str(formData, "landline"),
    referral: str(formData, "referral"),
    profession: str(formData, "profession"),
    gender: str(formData, "gender"),
    isForeign: formData.get("isForeign") === "on",
    birthDate: date(formData, "birthDate"),
    cpf: str(formData, "cpf"),
    rg: str(formData, "rg"),
    notes: str(formData, "notes"),
    emergencyName: str(formData, "emergencyName"),
    emergencyPhone: str(formData, "emergencyPhone"),
    cep: str(formData, "cep"),
    street: str(formData, "street"),
    complement: str(formData, "complement"),
    neighborhood: str(formData, "neighborhood"),
    city: str(formData, "city"),
    state: str(formData, "state"),
    guardianName: str(formData, "guardianName"),
    guardianCpf: str(formData, "guardianCpf"),
    guardianBirthDate: date(formData, "guardianBirthDate"),
    insurance: str(formData, "insurance") ?? "Particular",
    insuranceHolder: str(formData, "insuranceHolder"),
    insuranceCard: str(formData, "insuranceCard"),
    insuranceHolderCpf: str(formData, "insuranceHolderCpf"),
  };
}

export async function createPatient(formData: FormData) {
  const data = patientData(formData);
  if (!data.name) throw new Error("Nome completo é obrigatório.");

  const categories = parseCategories(formData);
  await prisma.patient.create({
    data: {
      ...data,
      categories: {
        connectOrCreate: categories.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  });

  revalidatePath("/pacientes");
  redirect("/pacientes");
}

export async function updatePatient(id: string, formData: FormData) {
  const data = patientData(formData);
  if (!data.name) throw new Error("Nome completo é obrigatório.");

  const categories = parseCategories(formData);
  await prisma.patient.update({
    where: { id },
    data: {
      ...data,
      categories: {
        set: [],
        connectOrCreate: categories.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  });

  revalidatePath("/pacientes");
  redirect("/pacientes");
}

export async function deletePatient(id: string) {
  await prisma.patient.delete({ where: { id } });
  revalidatePath("/pacientes");
  redirect("/pacientes");
}
