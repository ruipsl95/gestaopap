import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BiweeklyReportForm } from "@/components/student/biweekly-report-form";
import { RequestReportDeletionButton } from "@/components/student/request-report-deletion-button";
import { getCurrentPeriod, formatDate } from "@/lib/utils";

export default async function ReportPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { studentId: session.user.id },
  });

  if (!project) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-400">Ainda não tens um projeto atribuído.</p>
      </div>
    );
  }

  const { start, end } = getCurrentPeriod();

  // Check if already submitted for this period
  const existingReport = await prisma.biweeklyReport.findFirst({
    where: {
      projectId: project.id,
      periodStart: start,
    },
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
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatório Quinzenal</h1>
        <p className="text-slate-400 mt-1">
          Período: {formatDate(start)} — {formatDate(end)}
        </p>
      </div>

      {existingReport ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
          <p className="text-emerald-400 font-medium text-lg mb-2">
            ✅ Relatório já submetido para esta quinzena!
          </p>
          <p className="text-slate-400 text-sm">
            Progresso reportado: {existingReport.completionPercentage}%
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Podes atualizar os dados abaixo se necessário.
          </p>
          <div className="mt-4 text-left">
            <RequestReportDeletionButton
              reportId={existingReport.id}
              deletionRequested={existingReport.deletionRequested}
              deletionReason={existingReport.deletionReason}
            />
          </div>
        </div>
      ) : null}

      <BiweeklyReportForm existing={existingReport ? JSON.parse(JSON.stringify(existingReport)) : null} />
    </div>
  );
}
