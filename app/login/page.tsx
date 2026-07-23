import LoginForm from "@/components/login/LoginForm";

const FEATURES = [
  { icon: "📅", label: "Agenda inteligente, sem choque de horários" },
  { icon: "🗂️", label: "Prontuário, exames e receitas em um só lugar" },
  { icon: "💬", label: "Confirmação de consultas direto pelo WhatsApp" },
];

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 px-6 py-12">
      {/* Decorative animated blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob-1 absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-400/40 blur-3xl" />
        <div className="animate-blob-2 absolute right-[-10rem] top-1/3 h-[26rem] w-[26rem] rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="animate-blob-3 absolute bottom-[-12rem] left-1/4 h-[30rem] w-[30rem] rounded-full bg-brand-300/30 blur-3xl" />
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div className="text-white">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="animate-gentle-bob text-2xl">🦷</span>
            ADRIANA
          </div>

          <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight">
            Sua clínica, organizada do jeito certo.
          </h1>
          <p className="mt-4 max-w-md text-brand-100">
            Tudo o que a rotina da sua clínica odontológica precisa, em um
            sistema simples, rápido e feito para o seu dia a dia.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-brand-50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                  {f.icon}
                </span>
                {f.label}
              </li>
            ))}
          </ul>

          <p className="mt-12 text-xs text-brand-200">
            © {new Date().getFullYear()} ADRIANA — Sistema de gestão odontológica
          </p>
        </div>

        {/* Glass card */}
        <div className="animate-fade-in-up mx-auto w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
          <h2 className="text-xl font-bold text-white">Bem-vindo(a) de volta</h2>
          <p className="mt-1 mb-6 text-sm text-brand-100">
            Entre com sua conta para acessar o sistema.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
