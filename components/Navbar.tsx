"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/agenda", label: "Agenda", icon: "📅" },
  { href: "/pacientes", label: "Pacientes", icon: "👤" },
  { href: "/financeiro", label: "Financeiro", icon: "📊" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-6 px-4">
        <Link href="/pacientes" className="flex items-center gap-2">
          <span className="text-xl">🦷</span>
          <span className="text-lg font-bold text-brand-600">
            Adriana C. da Silva
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xs">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600">
            Conta
          </span>
        </div>
      </div>
    </header>
  );
}
