"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Bot, User, Trash2, Loader2, Sparkles, Compass } from "lucide-react";
import { clearStudentChatHistory } from "@/lib/actions";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface StudentChatbotProps {
  studentName: string;
  teacherName: string;
  projectTitle: string;
  hasTeacherGuidelines: boolean;
  hasProjectRoadmap: boolean;
  initialMessages: MessageItem[];
}

const QUICK_PROMPTS = [
  "Que tarefas devo fazer a seguir segundo o plano do orientador?",
  "Como posso dividir a minha próxima funcionalidade em passos simples?",
  "Estou com dificuldades técnicas, como devo abordar o problema?",
  "Que pontos devo preparar para a próxima reunião de orientação?",
];

export function StudentChatbot({
  studentName,
  teacherName,
  projectTitle,
  hasTeacherGuidelines,
  hasProjectRoadmap,
  initialMessages,
}: StudentChatbotProps) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, startClearTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isSending) return;

    setError(null);
    if (!textToSend) setInput("");

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text }]);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao comunicar com o assistente.");
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        {
          id: data.userMessage.id,
          role: "user",
          content: data.userMessage.content,
        },
        {
          id: data.assistantMessage.id,
          role: "assistant",
          content: data.assistantMessage.content,
        },
      ]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erro ao enviar mensagem.";
      setError(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = () => {
    if (!confirm("Tens a certeza que queres limpar o histórico desta conversa?")) return;
    startClearTransition(async () => {
      await clearStudentChatHistory();
      setMessages([]);
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] min-h-[500px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
              Assistente PAP (ChatGPT)
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Guiado pelas ideias e metodologia do orientador <strong className="text-slate-200">{teacherName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(hasTeacherGuidelines || hasProjectRoadmap) && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Compass className="h-3 w-3" />
              Roteiro do orientador ativo
            </span>
          )}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isClearing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
              title="Limpar conversa"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5 py-6">
            <div className="p-4 bg-gradient-to-br from-blue-500/15 to-emerald-500/15 border border-blue-500/20 rounded-2xl">
              <Sparkles className="h-8 w-8 text-blue-400 mx-auto" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-white">
                Olá {studentName.split(" ")[0]}! Como posso ajudar na tua PAP?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Estou ligado ao projeto <strong className="text-slate-200">{projectTitle}</strong> e conheço as diretrizes e caminhos traçados pelo professor {teacherName}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/40 text-xs text-slate-300 transition cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              A pensar com base nas diretrizes do orientador...
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            placeholder="Escreve a tua dúvida ou pede sugestões de tarefas para a tua PAP..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none max-h-32"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition cursor-pointer flex-shrink-0"
            title="Enviar mensagem"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
