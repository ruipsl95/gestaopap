import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ProgressChart } from "@/components/progress-chart";

export default async function HistoryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { studentId: session.user.id },
    include: {
      reports: {
        orderBy: { periodStart: "asc" },
      },
    },
  });

  const chartData =
    project?.reports.map((r) => ({
      period: formatDate(r.periodStart),
      percentage: r.completionPercentage,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico Completo</h1>
        <p className="text-slate-400 mt-1">Todos os relatórios submetidos</p>
      </div>

      {chartData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-4">Evolução do Progresso</h2>
          <ProgressChart data={chartData} />
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-800">
          {project?.reports
            .slice()
            .reverse()
            .map((report) => (
              <div key={report.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">
                    {formatDate(report.periodStart)} — {formatDate(report.periodEnd)}
                  </span>
                  <span className="text-sm font-semibold text-blue-400">
                    {report.completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full ${
                      report.completionPercentage >= 75
                        ? "bg-emerald-500"
                        : report.completionPercentage >= 50
                        ? "bg-blue-500"
                        : report.completionPercentage >= 25
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${report.completionPercentage}%` }}
                  />
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400 font-medium mb-1">✅ Tarefas realizadas:</p>
                    <p className="text-slate-300">{report.completedTasks}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">⚠️ Dificuldades:</p>
                    <p className="text-slate-300">{report.difficulties}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">🎯 Próximas tarefas:</p>
                    <p className="text-slate-300">{report.nextTasks}</p>
                  </div>
                </div>
              </div>
            ))}
          {(!project || project.reports.length === 0) && (
            <div className="p-8 text-center text-slate-500">
              Sem relatórios submetidos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
