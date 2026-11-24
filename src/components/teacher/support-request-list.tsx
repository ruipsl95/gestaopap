"use client";

import { useState, useTransition } from "react";
import { updateSupportRequestStatus } from "@/lib/actions";
import { MessageSquare, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface SupportRequest {
  id: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  createdAt: string;
  student: { name: string; email: string };
}

interface SupportRequestListProps {
  requests: SupportRequest[];
}

const statusOptions = [
  { value: "ABERTO", label: "Aberto", icon: AlertCircle, color: "text-red-400 bg-red-500/10" },
  { value: "EM_ANALISE", label: "Em Análise", icon: Clock, color: "text-amber-400 bg-amber-500/10" },
  { value: "RESOLVIDO", label: "Resolvido", icon: CheckCircle, color: "text-emerald-400 bg-emerald-500/10" },
];

export function SupportRequestList({ requests }: SupportRequestListProps) {
  const [responding, setResponding] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (
    id: string,
    newStatus: "ABERTO" | "EM_ANALISE" | "RESOLVIDO",
    responseText?: string
  ) => {
    startTransition(async () => {
      await updateSupportRequestStatus(id, newStatus, responseText);
      setResponding(null);
      setResponse("");
    });
  };

  if (requests.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Sem pedidos de suporte.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const currentStatus = statusOptions.find((s) => s.value === req.status);
        return (
          <div
            key={req.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{req.subject}</h3>
                <p className="text-sm text-slate-400">
                  {req.student.name} · {new Date(req.createdAt).toLocaleDateString("pt-PT")}
                </p>
              </div>
              {currentStatus && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${currentStatus.color}`}>
                  <currentStatus.icon className="h-3 w-3" />
                  {currentStatus.label}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 mb-4">{req.message}</p>

            {req.response && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg mb-4">
                <p className="text-xs text-emerald-400 font-medium mb-1">A sua resposta:</p>
                <p className="text-sm text-slate-300">{req.response}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {req.status !== "EM_ANALISE" && (
                <button
                  onClick={() => handleStatusChange(req.id, "EM_ANALISE")}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                  Em Análise
                </button>
              )}
              <button
                onClick={() => {
                  if (responding === req.id) {
                    setResponding(null);
                  } else {
                    setResponding(req.id);
                    setResponse(req.response ?? "");
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                {responding === req.id ? "Cancelar" : "Responder"}
              </button>
              {req.status !== "RESOLVIDO" && (
                <button
                  onClick={() => handleStatusChange(req.id, "RESOLVIDO")}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                >
                  Marcar Resolvido
                </button>
              )}
            </div>

            {/* Response form */}
            {responding === req.id && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 resize-none text-sm"
                  placeholder="Escreva a sua resposta ao aluno..."
                />
                <button
                  onClick={() => handleStatusChange(req.id, "RESOLVIDO", response)}
                  disabled={isPending || !response.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Enviar Resposta e Resolver"
                  )}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
