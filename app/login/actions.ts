"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(_prevState: string | undefined, formData: FormData): Promise<string | undefined> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "Preencha e-mail e senha.";
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return "E-mail ou senha incorretos.";
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return "E-mail ou senha incorretos.";
  }

  await setSessionCookie({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect("/pacientes");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
