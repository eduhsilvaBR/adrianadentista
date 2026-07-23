import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Navbar user={{ name: session.name, role: session.role }} />
      <main className="pt-14">{children}</main>
    </>
  );
}
