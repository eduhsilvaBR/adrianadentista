"use server";

import { prisma } from "@/lib/prisma";
import { combineDateTime } from "@/lib/utils";
import { revalidatePath } from "next/cache";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export async function createAppointment(formData: FormData) {
  const patientId = str(formData, "patientId");
  const dateKey = str(formData, "date");
  const time = str(formData, "time");
  if (!patientId || !dateKey || !time) throw new Error("Paciente, data e horário são obrigatórios.");

  await prisma.appointment.create({
    data: {
      patientId,
      professionalId: str(formData, "professionalId"),
      chairId: str(formData, "chairId"),
      date: combineDateTime(dateKey, time),
      duration: Number(str(formData, "duration") ?? "30"),
      notes: str(formData, "notes"),
      sendConfirmation: formData.get("sendConfirmation") === "true",
      returnIn: str(formData, "returnIn"),
      tag: str(formData, "tag"),
    },
  });
  revalidatePath("/agenda");
}

export async function updateAppointment(id: string, formData: FormData) {
  const dateKey = str(formData, "date");
  const time = str(formData, "time");
  if (!dateKey || !time) throw new Error("Data e horário são obrigatórios.");

  await prisma.appointment.update({
    where: { id },
    data: {
      professionalId: str(formData, "professionalId"),
      chairId: str(formData, "chairId"),
      date: combineDateTime(dateKey, time),
      duration: Number(str(formData, "duration") ?? "30"),
      notes: str(formData, "notes"),
      sendConfirmation: formData.get("sendConfirmation") === "true",
      returnIn: str(formData, "returnIn"),
      tag: str(formData, "tag"),
    },
  });
  revalidatePath("/agenda");
}

export async function updateAppointmentStatus(id: string, status: string) {
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/agenda");
}

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/agenda");
}

export async function createCommitment(formData: FormData) {
  const title = str(formData, "title");
  const startDate = str(formData, "startDate");
  const startTime = str(formData, "startTime");
  const endDate = str(formData, "endDate");
  const endTime = str(formData, "endTime");
  if (!title || !startDate || !startTime || !endDate || !endTime) {
    throw new Error("Preencha todos os campos do compromisso.");
  }

  await prisma.commitment.create({
    data: {
      title,
      professionalId: str(formData, "professionalId"),
      start: combineDateTime(startDate, startTime),
      end: combineDateTime(endDate, endTime),
      repeat: formData.get("repeat") === "on",
    },
  });
  revalidatePath("/agenda");
}

export async function deleteCommitment(id: string) {
  await prisma.commitment.delete({ where: { id } });
  revalidatePath("/agenda");
}

export async function createTask(formData: FormData) {
  const title = str(formData, "title");
  if (!title) throw new Error("Título da tarefa é obrigatório.");

  const dueDate = str(formData, "dueDate");
  const dueTime = str(formData, "dueTime");

  await prisma.task.create({
    data: {
      title,
      description: str(formData, "description"),
      dueDate: dueDate ? combineDateTime(dueDate, dueTime ?? "00:00") : null,
      list: str(formData, "list") ?? "Entrada",
      patientId: str(formData, "patientId"),
      professionalId: str(formData, "professionalId"),
    },
  });
  revalidatePath("/agenda");
}

export async function toggleTaskDone(id: string, done: boolean) {
  await prisma.task.update({ where: { id }, data: { done } });
  revalidatePath("/agenda");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/agenda");
}

export async function addChair(formData: FormData) {
  const name = str(formData, "name");
  if (!name) return;
  await prisma.chair.create({ data: { name } });
  revalidatePath("/agenda");
}

export async function addProfessional(formData: FormData) {
  const name = str(formData, "name");
  if (!name) return;
  await prisma.professional.create({
    data: {
      name,
      email: str(formData, "email"),
      cro: str(formData, "cro"),
    },
  });
  revalidatePath("/agenda");
}
