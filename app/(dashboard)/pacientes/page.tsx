import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  calcAge,
  formatDateBR,
  formatPhoneBR,
  onlyDigits,
  whatsappLink,
  MONTHS_BR,
} from "@/lib/utils";

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 182;

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q = "", tab = "buscar" } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Pacientes</h1>
        <Link
          href="/pacientes/novo"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          + Cadastrar paciente
        </Link>
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex gap-6 border-b border-gray-200 px-6">
          <Tab href="/pacientes" label="Buscar" active={tab === "buscar"} />
          <Tab
            href="/pacientes?tab=aniversariantes"
            label="Aniversariantes"
            active={tab === "aniversariantes"}
          />
          <Tab
            href="/pacientes?tab=retornos"
            label="Retornos semestrais"
            active={tab === "retornos"}
          />
        </div>

        <div className="p-6">
          {tab === "aniversariantes" ? (
            <BirthdaysTab />
          ) : tab === "retornos" ? (
            <ReturnsTab />
          ) : (
            <SearchTab q={q} />
          )}
        </div>
      </div>
    </div>
  );
}

function Tab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-brand-600 text-brand-600"
          : "border-transparent text-gray-600 hover:text-gray-800"
      }`}
    >
      {label}
    </Link>
  );
}

async function SearchTab({ q }: { q: string }) {
  const digits = onlyDigits(q);
  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            ...(digits
              ? [{ phone: { contains: digits } }, { cpf: { contains: digits } }]
              : [{ cpf: { contains: q } }]),
          ],
        }
      : undefined,
    include: { appointments: { orderBy: { date: "desc" }, take: 1 } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Busque por nome, telefone ou CPF"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </form>

      {patients.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          {q
            ? "Nenhum paciente encontrado para esta busca."
            : "Nenhum paciente cadastrado ainda. Clique em “Cadastrar paciente” para começar."}
        </p>
      ) : (
        <>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="pb-2 font-medium">Nome</th>
                <th className="pb-2 font-medium">CPF</th>
                <th className="pb-2 font-medium">Telefone</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const wa = whatsappLink(p.phone);
                const last = p.appointments[0];
                return (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <Link href={`/pacientes/${p.id}`} className="group flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                        <span>
                          <span className="block font-medium text-gray-800 group-hover:text-brand-600">
                            {p.name}
                          </span>
                          {last && (
                            <span className="block text-xs text-gray-500">
                              Última consulta: {formatDateBR(last.date)}
                            </span>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 text-gray-600">{p.cpf ?? "—"}</td>
                    <td className="py-3 text-gray-600">
                      {wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline"
                        >
                          🟢 {formatPhoneBR(p.phone)}
                        </a>
                      ) : (
                        formatPhoneBR(p.phone) || "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Mostrando {patients.length} de {patients.length} resultados
            </span>
            <span>
              Baixar lista de pacientes em:{" "}
              <a href="/api/pacientes/export" className="font-medium text-brand-600 hover:underline">
                CSV (Excel)
              </a>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

async function BirthdaysTab() {
  const month = new Date().getMonth();
  const all = await prisma.patient.findMany({
    where: { birthDate: { not: null } },
    orderBy: { name: "asc" },
  });
  const birthdays = all
    .filter((p) => p.birthDate!.getUTCMonth() === month)
    .sort((a, b) => a.birthDate!.getUTCDate() - b.birthDate!.getUTCDate());

  if (birthdays.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-500">
        Nenhum aniversariante em {MONTHS_BR[month]}.
      </p>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs text-gray-500">
          <th className="pb-2 font-medium">Nome</th>
          <th className="pb-2 font-medium">Aniversário</th>
          <th className="pb-2 font-medium">Telefone</th>
          <th className="pb-2 font-medium">Saudação manual</th>
        </tr>
      </thead>
      <tbody>
        {birthdays.map((p) => {
          const firstName = p.name.split(" ")[0];
          const wa = whatsappLink(
            p.phone,
            `Feliz aniversário, ${firstName}! 🎉 A equipe da Dra. Adriana C. da Silva deseja um dia maravilhoso!`
          );
          return (
            <tr key={p.id} className="border-t border-gray-100">
              <td className="py-3">
                <span className="block font-medium text-gray-800">{p.name}</span>
                <span className="text-xs text-gray-500">
                  {calcAge(p.birthDate!)} anos
                </span>
              </td>
              <td className="py-3 text-gray-600">
                {p.birthDate!.getUTCDate()} de {MONTHS_BR[p.birthDate!.getUTCMonth()]}
              </td>
              <td className="py-3 text-gray-600">{formatPhoneBR(p.phone) || "—"}</td>
              <td className="py-3">
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    🟢 Enviar saudação
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Sem telefone</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

async function ReturnsTab() {
  const cutoff = new Date(Date.now() - SIX_MONTHS_MS);
  const patients = await prisma.patient.findMany({
    include: { appointments: { orderBy: { date: "desc" }, take: 1 } },
    orderBy: { name: "asc" },
  });
  const toInvite = patients.filter(
    (p) => p.appointments.length > 0 && p.appointments[0].date < cutoff
  );

  if (toInvite.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="font-medium text-gray-700">
          Nenhum paciente para convidar a retornar
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Aqui você poderá ver todos os pacientes que realizaram sua última
          consulta há mais de 6 meses
        </p>
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs text-gray-500">
          <th className="pb-2 font-medium">Nome</th>
          <th className="pb-2 font-medium">Última consulta</th>
          <th className="pb-2 font-medium">Telefone</th>
          <th className="pb-2 font-medium">Convidar</th>
        </tr>
      </thead>
      <tbody>
        {toInvite.map((p) => {
          const firstName = p.name.split(" ")[0];
          const wa = whatsappLink(
            p.phone,
            `Olá, ${firstName}! Já faz mais de 6 meses desde sua última consulta com a Dra. Adriana. Que tal agendar uma avaliação? 🦷`
          );
          return (
            <tr key={p.id} className="border-t border-gray-100">
              <td className="py-3 font-medium text-gray-800">{p.name}</td>
              <td className="py-3 text-gray-600">
                {formatDateBR(p.appointments[0].date)}
              </td>
              <td className="py-3 text-gray-600">{formatPhoneBR(p.phone) || "—"}</td>
              <td className="py-3">
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    🟢 Convidar retorno
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Sem telefone</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
