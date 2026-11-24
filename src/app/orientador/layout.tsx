import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    redirect("/login");
  }

  return (
    <DashboardShell user={session.user} role="TEACHER">
      {children}
    </DashboardShell>
  );
}
