import LoginForm from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-2 text-lg font-bold">
          <span className="text-2xl">🦷</span>
          ADRIANA
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            Gestão completa da sua clínica odontológica
          </h1>
          <p className="mt-4 text-brand-100">
            Agenda, pacientes, exames, receitas e financeiro em um só lugar —
            simples, rápido e feito para o seu dia a dia.
          </p>
        </div>

        <p className="relative z-10 text-xs text-brand-200">
          © {new Date().getFullYear()} Adriana C. da Silva — Cirurgiã Dentista
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2">
        <div className="mb-8 flex items-center gap-2 text-lg font-bold text-brand-700 lg:hidden">
          <span className="text-2xl">🦷</span>
          ADRIANA
        </div>

        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">Bem-vindo(a) de volta</h2>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Entre com sua conta para acessar o sistema.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Acesso restrito à equipe da clínica.
        </p>
      </div>
    </div>
  );
}
