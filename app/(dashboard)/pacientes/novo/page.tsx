import PatientForm from "@/components/PatientForm";
import { createPatient } from "../actions";

export default function NovoPacientePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Cadastrar novo paciente
      </h1>
      <PatientForm action={createPatient} submitLabel="Criar paciente" />
    </div>
  );
}
