import { prisma } from "@/lib/db";
import { UserManagement } from "@/components/coordinator/user-management";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { role: { in: ["STUDENT", "TEACHER"] } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: {
      project: {
        select: { id: true, title: true },
      },
      orientandos: {
        select: { id: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Utilizadores</h1>
        <p className="text-slate-400 mt-1">Criar, editar e remover alunos e professores</p>
      </div>
      <UserManagement users={JSON.parse(JSON.stringify(users))} />
    </div>
  );
}
