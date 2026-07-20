"use client";

import { useState } from "react";

export type PatientFormValues = {
  name?: string;
  phone?: string | null;
  reminderVia?: string;
  email?: string | null;
  landline?: string | null;
  referral?: string | null;
  profession?: string | null;
  gender?: string | null;
  isForeign?: boolean;
  birthDate?: string | null;
  cpf?: string | null;
  rg?: string | null;
  notes?: string | null;
  categories?: string;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  cep?: string | null;
  street?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  guardianName?: string | null;
  guardianCpf?: string | null;
  guardianBirthDate?: string | null;
  insurance?: string;
  insuranceHolder?: string | null;
  insuranceCard?: string | null;
  insuranceHolderCpf?: string | null;
};

const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const REFERRALS = [
  "Indicação de paciente",
  "Indicação de amigo/família",
  "Instagram",
  "Facebook",
  "Google",
  "Passou em frente à clínica",
  "Convênio",
  "Outro",
];

function maskCpf(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCep(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1 block text-sm font-medium text-gray-700";
const sectionCls = "mb-2 mt-8 text-base font-semibold text-gray-800";

export default function PatientForm({
  action,
  initial = {},
  submitLabel = "Criar paciente",
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: PatientFormValues;
  submitLabel?: string;
}) {
  const [cpf, setCpf] = useState(initial.cpf ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [landline, setLandline] = useState(initial.landline ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(initial.emergencyPhone ?? "");
  const [guardianCpf, setGuardianCpf] = useState(initial.guardianCpf ?? "");
  const [insuranceHolderCpf, setInsuranceHolderCpf] = useState(initial.insuranceHolderCpf ?? "");
  const [cep, setCep] = useState(initial.cep ?? "");
  const [street, setStreet] = useState(initial.street ?? "");
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [uf, setUf] = useState(initial.state ?? "");
  const [cepLoading, setCepLoading] = useState(false);

  async function lookupCep(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (data.logradouro) setStreet(data.logradouro);
        if (data.bairro) setNeighborhood(data.bairro);
        if (data.localidade) setCity(data.localidade);
        if (data.uf) setUf(data.uf);
      }
    } catch {
      // sem conexão com ViaCEP — usuário preenche manualmente
    } finally {
      setCepLoading(false);
    }
  }

  return (
    <form action={action} className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
      {/* Dados básicos */}
      <div className="mb-4">
        <label className={labelCls}>
          <span className="text-red-500">*</span> Nome completo
        </label>
        <input name="name" required defaultValue={initial.name ?? ""} className={inputCls} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelCls}>Celular</label>
          <input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Lembretes automáticos</label>
          <select name="reminderVia" defaultValue={initial.reminderVia ?? "WhatsApp"} className={inputCls}>
            <option>WhatsApp</option>
            <option>SMS</option>
            <option>Não enviar</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input name="email" type="email" defaultValue={initial.email ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Telefone fixo</label>
          <input
            name="landline"
            value={landline}
            onChange={(e) => setLandline(maskPhone(e.target.value))}
            placeholder="(00) 0000-0000"
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Como conheceu a clínica</label>
          <select name="referral" defaultValue={initial.referral ?? ""} className={inputCls}>
            <option value=""></option>
            {REFERRALS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Profissão</label>
          <input name="profession" defaultValue={initial.profession ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Gênero</label>
          <select name="gender" defaultValue={initial.gender ?? ""} className={inputCls}>
            <option value=""></option>
            <option>Feminino</option>
            <option>Masculino</option>
            <option>Outro</option>
            <option>Prefiro não informar</option>
          </select>
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="isForeign"
          defaultChecked={initial.isForeign ?? false}
          className="h-4 w-4 rounded border-gray-300 accent-brand-600"
        />
        Paciente estrangeiro
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Data de nascimento</label>
          <input name="birthDate" type="date" defaultValue={initial.birthDate ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>CPF</label>
          <input
            name="cpf"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>RG</label>
          <input name="rg" defaultValue={initial.rg ?? ""} className={inputCls} />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelCls}>Adicionar observações</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initial.notes ?? ""}
          placeholder="Adicione observações sobre o paciente"
          className={inputCls}
        />
      </div>

      <div className="mt-4">
        <label className={labelCls}>Categorias</label>
        <input
          name="categories"
          defaultValue={initial.categories ?? ""}
          placeholder="Ex.: VIP, Ortodontia, Convênio (separe por vírgula)"
          className={inputCls}
        />
      </div>

      {/* Contato de emergência */}
      <h2 className={sectionCls}>Contato de emergência</h2>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className={labelCls}>Nome</label>
          <input name="emergencyName" defaultValue={initial.emergencyName ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Telefone</label>
          <input
            name="emergencyPhone"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(maskPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            className={inputCls}
          />
        </div>
      </div>

      {/* Endereço */}
      <h2 className={sectionCls}>Endereço</h2>
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr_1fr]">
        <div>
          <label className={labelCls}>CEP {cepLoading && <span className="text-xs text-gray-400">buscando…</span>}</label>
          <input
            name="cep"
            value={cep}
            onChange={(e) => setCep(maskCep(e.target.value))}
            onBlur={(e) => lookupCep(e.target.value)}
            placeholder="00000-000"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Endereço com número</label>
          <input
            name="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Complemento</label>
          <input name="complement" defaultValue={initial.complement ?? ""} className={inputCls} />
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Bairro</label>
          <input
            name="neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Cidade</label>
          <input name="city" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Estado</label>
          <select name="state" value={uf} onChange={(e) => setUf(e.target.value)} className={inputCls}>
            <option value=""></option>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Responsável */}
      <h2 className={sectionCls}>Responsável</h2>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <label className={labelCls}>Nome do responsável</label>
          <input name="guardianName" defaultValue={initial.guardianName ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>CPF</label>
          <input
            name="guardianCpf"
            value={guardianCpf}
            onChange={(e) => setGuardianCpf(maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Data de nascimento</label>
          <input
            name="guardianBirthDate"
            type="date"
            defaultValue={initial.guardianBirthDate ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      {/* Convênio */}
      <h2 className={sectionCls}>Dados do Convênio</h2>
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div>
          <label className={labelCls}>Convênio</label>
          <select name="insurance" defaultValue={initial.insurance ?? "Particular"} className={inputCls}>
            <option>Particular</option>
            <option>Amil Dental</option>
            <option>Bradesco Dental</option>
            <option>SulAmérica Odonto</option>
            <option>OdontoPrev</option>
            <option>Uniodonto</option>
            <option>Outro</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Titular do convênio</label>
          <input name="insuranceHolder" defaultValue={initial.insuranceHolder ?? ""} className={inputCls} />
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Número da carteirinha</label>
          <input name="insuranceCard" defaultValue={initial.insuranceCard ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>CPF do Responsável</label>
          <input
            name="insuranceHolderCpf"
            value={insuranceHolderCpf}
            onChange={(e) => setInsuranceHolderCpf(maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          ✓ {submitLabel}
        </button>
      </div>
    </form>
  );
}
