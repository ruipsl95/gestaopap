import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, HelpCircle, TrendingUp, BookOpen } from "lucide-react";
import { ProgressChart } from "@/components/progress-chart";
import { formatDate } from "@/lib/utils";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { studentId: session.user.id },
    include: {
      teacher: { select: { name: true } },
      reports: {
        orderBy: { periodStart: "asc" },
      },
    },
  });

  const supportRequests = await prisma.supportRequest.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const latestPercentage =
    project?.reports[project.reports.length - 1]?.completionPercentage ?? 0;

  const chartData =
    project?.reports.map((r) => ({
      period: formatDate(r.periodStart),
      percentage: r.completionPercentage,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">O Meu Progresso</h1>
        {project && (
          <p className="text-slate-400 mt-1">{project.title}</p>
        )}
      </div>

      {!project ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            Ainda não tens um projeto atribuído. Contacta o coordenador.
          </p>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="bg-blue-500/10 p-2 rounded-lg w-fit mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{latestPercentage}%</p>
              <p className="text-sm text-slate-400">Progresso Atual</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="bg-emerald-500/10 p-2 rounded-lg w-fit mb-2">
                <ClipboardCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{project.reports.length}</p>
              <p className="text-sm text-slate-400">Relatórios</p>
            </div>
          </div>

          {/* Progress Chart */}
          {chartData.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="font-semibold text-lg mb-4">Evolução</h2>
              <ProgressChart data={chartData} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/aluno/relatorio"
              className="bg-blue-600 hover:bg-blue-700 rounded-xl p-5 transition-colors flex items-center gap-4"
            >
              <ClipboardCheck className="h-8 w-8 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Relatório Quinzenal</h3>
                <p className="text-sm text-blue-200">
                  Preencher o check-in desta quinzena
                </p>
              </div>
            </Link>
            <Link
              href="/aluno/suporte"
              className="bg-amber-600 hover:bg-amber-700 rounded-xl p-5 transition-colors flex items-center gap-4"
            >
              <HelpCircle className="h-8 w-8 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Pedir Suporte</h3>
                <p className="text-sm text-amber-200">
                  Enviar dúvida ao orientador
                </p>
              </div>
            </Link>
          </div>

          {/* Recent Reports */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Últimos Relatórios</h2>
              <Link
                href="/aluno/historico"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Ver todos →
              </Link>
            </div>
            <div className="divide-y divide-slate-800">
              {project.reports
                .slice()
                .reverse()
                .slice(0, 3)
                .map((report) => (
                  <div key={report.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">
                        {formatDate(report.periodStart)}
                      </span>
                      <span className="text-sm font-semibold text-blue-400">
                        {report.completionPercentage}%
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {report.completedTasks}
                    </p>
                  </div>
                ))}
              {project.reports.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  Sem relatórios submetidos. Preenche o teu primeiro check-in!
                </div>
              )}
            </div>
          </div>

          {/* Support Requests */}
          {supportRequests.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h2 className="font-semibold text-lg">Pedidos de Suporte Recentes</h2>
              </div>
              <div className="divide-y divide-slate-800">
                {supportRequests.map((req) => (
                  <div key={req.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{req.subject}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          req.status === "RESOLVIDO"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : req.status === "EM_ANALISE"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {req.status === "EM_ANALISE" ? "EM ANÁLISE" : req.status}
                      </span>
                    </div>
                    {req.response && (
                      <p className="text-sm text-emerald-400 mt-2 bg-emerald-500/5 p-2 rounded-lg">
                        💬 {req.response}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
