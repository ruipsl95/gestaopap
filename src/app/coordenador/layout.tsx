import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "COORDINATOR") {
    redirect("/login");
  }

  return (
    <DashboardShell user={session.user} role="COORDINATOR">
      {children}
    </DashboardShell>
  );
}
