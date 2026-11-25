"use client";

import { useState, useTransition } from "react";
import { Bot, Save, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { updateTeacherAiGuidelines } from "@/lib/actions";

interface TeacherAiGuidelinesEditorProps {
  initialGuidelines: string | null;
}

export function TeacherAiGuidelinesEditor({
  initialGuidelines,
}: TeacherAiGuidelinesEditorProps) {
  const [guidelines, setGuidelines] = useState(initialGuidelines || "");
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateTeacherAiGuidelines(guidelines);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        console.error(err);
        alert("Erro ao guardar as diretrizes.");
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-purple-500/30 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/15 text-purple-400 rounded-lg">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-sm sm:text-base text-white">
              Metodologia &amp; Diretrizes do Orientador (Chatbot ChatGPT)
            </h2>
            <p className="text-xs text-slate-400">
              Defina como pensa, organiza tarefas e traça caminhos — o chatbot dos seus alunos seguirá estas regras.
            </p>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {isOpen && (
        <form onSubmit={handleSave} className="p-4 pt-0 space-y-3 border-t border-slate-800/80">
          <textarea
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            rows={5}
            placeholder="Ex: Nas PAPs prefiro que comecem por definir o modelo de dados e um MVP simples. As tarefas devem ser divididas em metas semanais testáveis. Incentivar sempre o aluno a documentar à medida que programa..."
            className="w-full mt-3 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {saved ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="h-3.5 w-3.5" /> Diretrizes guardadas! O ChatGPT dos seus alunos já as usa.
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Estas instruções aplicam-se a todos os seus orientandos.
              </span>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Guardar Diretrizes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
