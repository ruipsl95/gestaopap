"use client";

import { useState, useTransition } from "react";
import { submitBiweeklyReport } from "@/lib/actions";
import { Loader2, CheckCircle } from "lucide-react";

interface BiweeklyReportFormProps {
  existing: {
    completedTasks: string;
    completionPercentage: number;
    difficulties: string;
    nextTasks: string;
    reportDate?: string | Date;
  } | null;
}

export function BiweeklyReportForm({ existing }: BiweeklyReportFormProps) {
  const defaultDate = existing?.reportDate
    ? new Date(existing.reportDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const [percentage, setPercentage] = useState(
    existing?.completionPercentage ?? 0
  );
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (formData: FormData) => {
    formData.set("completionPercentage", percentage.toString());
    startTransition(async () => {
      await submitBiweeklyReport(formData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        {/* Report Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            📅 Data de realização do relatório *
          </label>
          <input
            type="date"
            name="reportDate"
            defaultValue={defaultDate}
            required
            className="w-full sm:w-auto bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Indica o dia em que realizaste este registo/relatório.
          </p>
        </div>

        {/* Completed Tasks */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            📋 Tarefas realizadas desde a última orientação *
          </label>
          <textarea
            name="completedTasks"
            defaultValue={existing?.completedTasks ?? ""}
            required
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 resize-none"
            placeholder="Descreve as tarefas que realizaste..."
          />
        </div>

        {/* Completion Percentage Slider */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            📊 Percentagem de conclusão da PAP *
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">0%</span>
              <span className="text-3xl font-bold text-blue-400">
                {percentage}%
              </span>
              <span className="text-sm text-slate-400">100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`,
              }}
            />
            <div className="w-full bg-slate-800 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  percentage >= 75
                    ? "bg-emerald-500"
                    : percentage >= 50
                    ? "bg-blue-500"
                    : percentage >= 25
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Difficulties */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            ⚠️ Dificuldades sentidas e o que fizeste para as ultrapassar *
          </label>
          <textarea
            name="difficulties"
            defaultValue={existing?.difficulties ?? ""}
            required
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 resize-none"
            placeholder="Descreve as dificuldades e como as resolveste..."
          />
        </div>

        {/* Next Tasks */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            🎯 Tarefas a que te comprometes para a próxima quinzena *
          </label>
          <textarea
            name="nextTasks"
            defaultValue={existing?.nextTasks ?? ""}
            required
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 resize-none"
            placeholder="Que tarefas vais realizar nas próximas 2 semanas..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            A submeter...
          </>
        ) : submitted ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Relatório Submetido!
          </>
        ) : (
          "Submeter Relatório"
        )}
      </button>
    </form>
  );
}
