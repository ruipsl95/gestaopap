"use client";

import { useState, useTransition } from "react";
import { Trash2, Clock, X, Loader2, Check } from "lucide-react";
import { requestReportDeletion, cancelReportDeletionRequest } from "@/lib/actions";

interface RequestReportDeletionButtonProps {
  reportId: string;
  deletionRequested: boolean;
  deletionReason?: string | null;
}

export function RequestReportDeletionButton({
  reportId,
  deletionRequested,
  deletionReason,
}: RequestReportDeletionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await requestReportDeletion(reportId, reason);
        setIsOpen(false);
        setReason("");
      } catch (err) {
        console.error(err);
        alert("Erro ao enviar pedido de remoção.");
      }
    });
  };

  const handleCancelRequest = () => {
    startTransition(async () => {
      try {
        await cancelReportDeletionRequest(reportId);
      } catch (err) {
        console.error(err);
        alert("Erro ao cancelar pedido de remoção.");
      }
    });
  };

  if (deletionRequested) {
    return (
      <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Remoção solicitada — a aguardar aprovação do orientador
          </p>
          {deletionReason && (
            <p className="text-slate-300 italic">Motivo: &ldquo;{deletionReason}&rdquo;</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCancelRequest}
          disabled={isPending}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3 w-3" />
          )}
          Cancelar pedido
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Solicitar Remoção do Relatório
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleRequest}
      className="mt-3 p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl space-y-3 text-xs"
    >
      <p className="font-semibold text-red-300">
        Solicitar remoção deste relatório ao professor orientador?
      </p>
      <p className="text-slate-400">
        O relatório só será eliminado da base de dados caso o teu orientador aceite o pedido.
      </p>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo do pedido (opcional, ex: submetido por engano)..."
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              A enviar...
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              Enviar Pedido de Remoção
            </>
          )}
        </button>
      </div>
    </form>
  );
}
