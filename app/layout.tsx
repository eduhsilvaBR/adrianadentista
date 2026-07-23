import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adriana C. da Silva — Gestão da Clínica",
  description: "Sistema de gestão para clínica odontológica",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
