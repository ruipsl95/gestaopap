import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SupportRequestList } from "@/components/teacher/support-request-list";

export default async function SupportPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const requests = await prisma.supportRequest.findMany({
    where: { teacherId: session.user.id },
    include: {
      student: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos de Suporte</h1>
        <p className="text-slate-400 mt-1">
          Responda às dúvidas e pedidos dos seus alunos
        </p>
      </div>
      <SupportRequestList requests={JSON.parse(JSON.stringify(requests))} />
    </div>
  );
}
