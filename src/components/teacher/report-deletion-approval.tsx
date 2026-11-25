"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Check, X, Loader2 } from "lucide-react";
import { respondToReportDeletion } from "@/lib/actions";

interface ReportDeletionApprovalProps {
  reportId: string;
  studentName: string;
  deletionReason?: string | null;
}

export function ReportDeletionApproval({
  reportId,
  studentName,
  deletionReason,
}: ReportDeletionApprovalProps) {
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const handleDecision = (approve: boolean) => {
    if (
      approve &&
      !confirm(
        `Tem a certeza que deseja ACEITAR e ELIMINAR permanentemente este relatório de ${studentName}? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setActionType(approve ? "approve" : "reject");
    startTransition(async () => {
      try {
        await respondToReportDeletion(reportId, approve);
      } catch (err) {
        console.error(err);
        alert("Erro ao processar a decisão.");
      } finally {
        setActionType(null);
      }
    });
  };

  return (
    <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 flex-shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-amber-300">
            Pedido de Remoção Solicitado pelo Aluno
          </p>
          <p className="text-slate-300 text-xs mt-0.5">
            {studentName} solicitou a eliminação deste relatório. Só será removido da base de dados se aceitar.
          </p>
          {deletionReason && (
            <p className="text-xs text-amber-200/90 mt-1.5 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-amber-500/20">
              <strong>Motivo indicado:</strong> {deletionReason}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleDecision(false)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50 cursor-pointer"
        >
          {isPending && actionType === "reject" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          Recusar Pedido
        </button>

        <button
          type="button"
          onClick={() => handleDecision(true)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50 cursor-pointer"
        >
          {isPending && actionType === "approve" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Aceitar e Eliminar Relatório
        </button>
      </div>
    </div>
  );
}
