import { prisma } from "@/lib/db";
import { Users, GraduationCap, BookOpen, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function CoordinatorDashboard() {
  const [students, teachers, projects] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.project.findMany({
      include: {
        student: { select: { name: true } },
        teacher: { select: { name: true } },
        reports: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  const projectsWithProgress = projects.map((p) => ({
    ...p,
    latestPercentage: p.reports[0]?.completionPercentage ?? 0,
  }));

  const avgProgress =
    projectsWithProgress.length > 0
      ? Math.round(
          projectsWithProgress.reduce((acc, p) => acc + p.latestPercentage, 0) /
            projectsWithProgress.length
        )
      : 0;

  const behindSchedule = projectsWithProgress.filter(
    (p) => p.latestPercentage < 25
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard do Coordenador</h1>
        <p className="text-slate-400 mt-1">Visão geral de todos os projetos PAP</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold">{students}</p>
          <p className="text-sm text-slate-400">Alunos</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold">{teachers}</p>
          <p className="text-sm text-slate-400">Professores</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold">{avgProgress}%</p>
          <p className="text-sm text-slate-400">Média Progresso</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-500/10 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold">{behindSchedule.length}</p>
          <p className="text-sm text-slate-400">Em Atraso</p>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Projetos</h2>
          <Link
            href="/coordenador/projetos"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Gerir Projetos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-left p-4 font-medium">Aluno</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Projeto</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Orientador</th>
                <th className="text-left p-4 font-medium">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {projectsWithProgress.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30"
                >
                  <td className="p-4">
                    <p className="font-medium">{project.student.name}</p>
                    <p className="text-xs text-slate-400 sm:hidden mt-0.5">{project.title}</p>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-slate-300 max-w-[200px] truncate">
                    {project.title}
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-400">
                    {project.teacher.name}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-[60px] max-w-[120px] bg-slate-800 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            project.latestPercentage >= 75
                              ? "bg-emerald-500"
                              : project.latestPercentage >= 50
                              ? "bg-blue-500"
                              : project.latestPercentage >= 25
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${project.latestPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[36px]">
                        {project.latestPercentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {projectsWithProgress.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Nenhum projeto registado. Comece por criar utilizadores e projetos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/coordenador/utilizadores"
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors group"
        >
          <Users className="h-6 w-6 text-blue-500 mb-2" />
          <h3 className="font-semibold group-hover:text-blue-400">Gerir Utilizadores</h3>
          <p className="text-sm text-slate-400 mt-1">
            Criar e editar contas de alunos e professores
          </p>
        </Link>
        <Link
          href="/coordenador/projetos"
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 transition-colors group"
        >
          <BookOpen className="h-6 w-6 text-emerald-500 mb-2" />
          <h3 className="font-semibold group-hover:text-emerald-400">Gerir Projetos</h3>
          <p className="text-sm text-slate-400 mt-1">
            Atribuir projetos e orientadores aos alunos
          </p>
        </Link>
      </div>
    </div>
  );
}
