import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar user={session.user} />
      <main
        className="flex-1 overflow-auto bg-zinc-950"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(63,63,70,0.7) transparent",
        }}
      >
        {children}
      </main>
    </div>
  );
}