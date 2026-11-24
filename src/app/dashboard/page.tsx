import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "COORDINATOR") {
    redirect("/coordenador");
  } else if (session.user.role === "TEACHER") {
    redirect("/orientador");
  } else if (session.user.role === "STUDENT") {
    redirect("/aluno");
  }

  redirect("/");
}
