"use client";

import { useState } from "react";
import { Sparkles, Loader2, Send, Check, MessageSquare, Bot } from "lucide-react";
import { generateReportAiCommentary, saveTeacherReportFeedback } from "@/lib/actions";

interface AiReportFeedbackProps {
  reportId: string;
  initialAiCommentary: string | null;
  initialTeacherFeedback: string | null;
  studentName: string;
}

export function AiReportFeedback({
  reportId,
  initialAiCommentary,
  initialTeacherFeedback,
  studentName,
}: AiReportFeedbackProps) {
  const [aiCommentary, setAiCommentary] = useState<string | null>(initialAiCommentary);
  const [teacherFeedback, setTeacherFeedback] = useState<string>(initialTeacherFeedback || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(Boolean(initialAiCommentary));

  const handleGenerateAi = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateReportAiCommentary(reportId);
      if (res?.aiCommentary) {
        setAiCommentary(res.aiCommentary);
        setShowAiDetails(true);

        // Se o professor ainda não tiver feedback escrito, tentar extrair a sugestão para a caixa de texto
        if (!teacherFeedback.trim()) {
          const match = res.aiCommentary.match(/### 💬 Sugestão de Feedback para o Aluno\s*\n([\s\S]*?)(?=\n###|\n\n###|$)/i);
          if (match && match[1]) {
            const suggestion = match[1].trim().replace(/^"|"$/g, "");
            setTeacherFeedback(suggestion);
          }
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Não foi possível gerar a análise por IA. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySuggestion = () => {
    if (!aiCommentary) return;
    const match = aiCommentary.match(/### 💬 Sugestão de Feedback para o Aluno\s*\n([\s\S]*?)(?=\n###|\n\n###|$)/i);
    if (match && match[1]) {
      const suggestion = match[1].trim().replace(/^"|"$/g, "");
      setTeacherFeedback(suggestion);
    } else {
      setTeacherFeedback(aiCommentary);
    }
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await saveTeacherReportFeedback(reportId, teacherFeedback);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error(err);
      setError("Erro ao guardar o feedback. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
      {/* Botão de ativação da IA e estado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
          <Bot className="h-4 w-4" />
          <span>Assistente IA Pedagógico</span>
        </div>

        <button
          type="button"
          onClick={handleGenerateAi}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm transition disabled:opacity-60 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              A analisar com IA...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              {aiCommentary ? "Regenerar Análise com IA" : "Gerar Análise com IA"}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Caixa com o resultado da IA */}
      {aiCommentary && (
        <div className="bg-gradient-to-b from-purple-950/30 to-slate-900 border border-purple-500/20 rounded-xl p-4 text-sm text-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Parecer & Recomendações da IA
            </span>
            <button
              type="button"
              onClick={() => setShowAiDetails(!showAiDetails)}
              className="text-xs text-slate-400 hover:text-purple-300"
            >
              {showAiDetails ? "Ocultar detalhes" : "Ver parecer completo"}
            </button>
          </div>

          {showAiDetails && (
            <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-line text-slate-300 bg-slate-950/60 p-3.5 rounded-lg border border-purple-900/30">
              {aiCommentary}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopySuggestion}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1.5"
            >
              📋 Usar sugestão de mensagem no feedback
            </button>
          </div>
        </div>
      )}

      {/* Caixa de Feedback do Orientador para o Aluno */}
      <form onSubmit={handleSaveFeedback} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
            Comentário do Orientador (visível para {studentName})
          </label>
          {initialTeacherFeedback && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3" /> Já enviado ao aluno
            </span>
          )}
        </div>

        <textarea
          value={teacherFeedback}
          onChange={(e) => setTeacherFeedback(e.target.value)}
          rows={3}
          placeholder="Escreva aqui o seu feedback, observações ou orientações para o aluno consultar..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          {saveSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="h-3.5 w-3.5" /> Feedback guardado e disponível para o aluno!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              O aluno verá este comentário no histórico e no painel principal.
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving || !teacherFeedback.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                Guardar Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
