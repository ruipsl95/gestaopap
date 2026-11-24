import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SupportRequestForm } from "@/components/student/support-request-form";
import { formatDateTime } from "@/lib/utils";

export default async function SupportPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { studentId: session.user.id },
    include: { teacher: { select: { name: true } } },
  });

  const requests = await prisma.supportRequest.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedir Suporte</h1>
        {project && (
          <p className="text-slate-400 mt-1">
            Orientador: {project.teacher.name}
          </p>
        )}
      </div>

      {project ? (
        <SupportRequestForm teacherName={project.teacher.name} />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <p className="text-slate-400">Ainda não tens um projeto atribuído.</p>
        </div>
      )}

      {/* History */}
      {requests.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-lg">Histórico de Pedidos</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {requests.map((req) => (
              <div key={req.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{req.subject}</p>
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
                <p className="text-sm text-slate-400 mb-1">{req.message}</p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(req.createdAt)}
                </p>
                {req.response && (
                  <div className="mt-3 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                    <p className="text-xs text-emerald-400 font-medium mb-1">
                      Resposta do orientador:
                    </p>
                    <p className="text-sm text-slate-300">{req.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
