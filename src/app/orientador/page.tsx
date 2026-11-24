import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, MessageSquare, TrendingUp, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const [projects, supportRequests] = await Promise.all([
    prisma.project.findMany({
      where: { teacherId: session.user.id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        reports: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.supportRequest.count({
      where: {
        teacherId: session.user.id,
        status: { in: ["ABERTO", "EM_ANALISE"] },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Os Meus Orientandos</h1>
        <p className="text-slate-400 mt-1">
          Acompanhe o progresso dos alunos que orienta
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="bg-blue-500/10 p-2 rounded-lg w-fit mb-2">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-sm text-slate-400">Orientandos</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="bg-amber-500/10 p-2 rounded-lg w-fit mb-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold">{supportRequests}</p>
          <p className="text-sm text-slate-400">Pedidos Pendentes</p>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {projects.map((project) => {
          const percentage = project.reports[0]?.completionPercentage ?? 0;
          return (
            <Link
              key={project.id}
              href={`/orientador/aluno/${project.studentId}`}
              className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {project.student.name}
                  </h3>
                  <p className="text-sm text-slate-400">{project.title}</p>
                  {project.orientationDate ? (
                    <p className="text-xs text-blue-400 font-medium flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Orientação: {formatDateTime(project.orientationDate)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">
                      Sem orientação agendada
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="font-semibold">{percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    percentage >= 75
                      ? "bg-emerald-500"
                      : percentage >= 50
                      ? "bg-blue-500"
                      : percentage >= 25
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </Link>
          );
        })}
        {projects.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              Ainda não tem alunos atribuídos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
