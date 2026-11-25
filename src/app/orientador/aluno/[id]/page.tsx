import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProgressChart } from "@/components/progress-chart";
import { OrientationScheduler } from "@/components/teacher/orientation-scheduler";
import { ProjectAiRoadmapEditor } from "@/components/teacher/project-ai-roadmap-editor";
import { AiReportFeedback } from "@/components/teacher/ai-report-feedback";
import { ReportDeletionApproval } from "@/components/teacher/report-deletion-approval";
import { AttachmentsList } from "@/components/attachments-list";
import { formatDate } from "@/lib/utils";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const project = await prisma.project.findFirst({
    where: {
      studentId: id,
      teacherId: session.user.id,
    },
    include: {
      student: true,
      reports: {
        orderBy: { periodStart: "asc" },
        include: {
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              fileSize: true,
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const chartData = project.reports.map((r) => ({
    period: formatDate(r.periodStart),
    percentage: r.completionPercentage,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/orientador"
          className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{project.student.name}</h1>
          <p className="text-slate-400">{project.title}</p>
        </div>
      </div>

      {/* Agendamento de Orientação */}
      <OrientationScheduler
        projectId={project.id}
        currentDate={project.orientationDate}
        currentPlace={project.orientationPlace}
        studentName={project.student.name}
      />

      {/* Ideias & Caminho Traçado para o Chatbot */}
      <ProjectAiRoadmapEditor
        projectId={project.id}
        studentName={project.student.name}
        initialRoadmap={project.aiRoadmap}
      />

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-4">Evolução do Progresso</h2>
          <ProgressChart data={chartData} />
        </div>
      )}

      {/* Reports History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-lg">Histórico de Relatórios</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {project.reports
            .slice()
            .reverse()
            .map((report) => (
              <div key={report.id} className="p-5">
                {report.deletionRequested && (
                  <ReportDeletionApproval
                    reportId={report.id}
                    studentName={project.student.name}
                    deletionReason={report.deletionReason}
                  />
                )}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-sm font-semibold text-white">
                      📅 Realizado em: {formatDate(report.reportDate || report.createdAt)}
                    </span>
                    <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                      (Quinzena: {formatDate(report.periodStart)} — {formatDate(report.periodEnd)})
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-blue-400">
                    {report.completionPercentage}%
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Tarefas realizadas:</p>
                    <p className="text-slate-300">{report.completedTasks}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Dificuldades:</p>
                    <p className="text-slate-300">{report.difficulties}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Próximas tarefas:</p>
                    <p className="text-slate-300">{report.nextTasks}</p>
                  </div>
                </div>

                {/* Anexos (Word, PDF, ZIP, etc.) */}
                <AttachmentsList attachments={report.attachments} />

                {/* IA & Feedback do Orientador */}
                <AiReportFeedback
                  reportId={report.id}
                  initialAiCommentary={report.aiCommentary}
                  initialTeacherFeedback={report.teacherFeedback}
                  studentName={project.student.name}
                />
              </div>
            ))}
          {project.reports.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Sem relatórios submetidos ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
