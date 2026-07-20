import { prisma } from "@/lib/prisma";
import { formatDateBR, formatPhoneBR } from "@/lib/utils";

function csvCell(value: string | null | undefined): string {
  const v = value ?? "";
  return /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function GET() {
  const patients = await prisma.patient.findMany({
    include: { categories: true },
    orderBy: { name: "asc" },
  });

  const header = [
    "Nome", "Celular", "Email", "Telefone fixo", "Nascimento", "CPF", "RG",
    "Gênero", "Profissão", "Como conheceu", "Convênio", "Carteirinha",
    "CEP", "Endereço", "Complemento", "Bairro", "Cidade", "Estado",
    "Categorias", "Observações",
  ];

  const rows = patients.map((p) =>
    [
      p.name,
      formatPhoneBR(p.phone),
      p.email,
      formatPhoneBR(p.landline),
      formatDateBR(p.birthDate),
      p.cpf,
      p.rg,
      p.gender,
      p.profession,
      p.referral,
      p.insurance,
      p.insuranceCard,
      p.cep,
      p.street,
      p.complement,
      p.neighborhood,
      p.city,
      p.state,
      p.categories.map((c) => c.name).join(", "),
      p.notes,
    ]
      .map(csvCell)
      .join(";")
  );

  const csv = "﻿" + [header.join(";"), ...rows].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pacientes.csv"',
    },
  });
}
