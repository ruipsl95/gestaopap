"use client";

import { useState, useTransition } from "react";
import { Compass, Save, Check, Loader2 } from "lucide-react";
import { updateProjectAiRoadmap } from "@/lib/actions";

interface ProjectAiRoadmapEditorProps {
  projectId: string;
  studentName: string;
  initialRoadmap: string | null;
}

export function ProjectAiRoadmapEditor({
  projectId,
  studentName,
  initialRoadmap,
}: ProjectAiRoadmapEditorProps) {
  const [roadmap, setRoadmap] = useState(initialRoadmap || "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateProjectAiRoadmap(projectId, roadmap);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        console.error(err);
        alert("Erro ao guardar o roteiro do projeto.");
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-lg flex-shrink-0">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-base text-white">
            Ideias &amp; Caminho Traçado para o Chatbot ({studentName})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Escreva aqui as suas ideias, arquitetura sugerida ou sequência de tarefas para este aluno. O Chatbot (ChatGPT) usará este plano ao orientar o aluno.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <textarea
          value={roadmap}
          onChange={(e) => setRoadmap(e.target.value)}
          rows={4}
          placeholder="Ex: Fase 1: Terminar base de dados e autenticação até dia 10. Fase 2: Implementar painel de stock com alertas de mínimo. Fase 3: Relatório escrito focado na arquitetura e testes..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          {saved ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="h-3.5 w-3.5" /> Caminho guardado! O assistente do aluno já está atualizado.
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              Visível como guia para a IA no chat do aluno.
            </span>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Guardar Caminho
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
