"use client";

import { useState, useTransition } from "react";
import { createSupportRequest } from "@/lib/actions";
import { Loader2, CheckCircle, Send } from "lucide-react";

interface SupportRequestFormProps {
  teacherName: string;
}

export function SupportRequestForm({ teacherName }: SupportRequestFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createSupportRequest(formData);
      setSubmitted(true);
      // Reset form
      const form = document.getElementById("support-form") as HTMLFormElement;
      form?.reset();
      setTimeout(() => setSubmitted(false), 3000);
    });
  };

  return (
    <form id="support-form" action={handleSubmit} className="space-y-5">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-400">
            💬 O teu pedido será enviado diretamente ao <strong>{teacherName}</strong>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Assunto *
          </label>
          <input
            name="subject"
            type="text"
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500"
            placeholder="Ex: Dúvida sobre implementação da base de dados"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Mensagem *
          </label>
          <textarea
            name="message"
            required
            rows={5}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 resize-none"
            placeholder="Descreve a tua dúvida ou pedido de reunião..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            A enviar...
          </>
        ) : submitted ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Pedido Enviado!
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Enviar Pedido de Suporte
          </>
        )}
      </button>
    </form>
  );
}
