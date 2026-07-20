import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Adriana C. da Silva — Gestão da Clínica",
  description: "Sistema de gestão para clínica odontológica",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
