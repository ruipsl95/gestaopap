"use client";

import { useState, useTransition, useRef } from "react";
import { submitBiweeklyReport } from "@/lib/actions";
import { Loader2, CheckCircle, Upload, Paperclip, X, FileArchive, FileText } from "lucide-react";
import { AttachmentsList, AttachmentItem, formatFileSize } from "@/components/attachments-list";

interface BiweeklyReportFormProps {
  existing: {
    id?: string;
    completedTasks: string;
    completionPercentage: number;
    difficulties: string;
    nextTasks: string;
    reportDate?: string | Date;
    attachments?: AttachmentItem[];
  } | null;
}

export function BiweeklyReportForm({ existing }: BiweeklyReportFormProps) {
  const defaultDate = existing?.reportDate
    ? new Date(existing.reportDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const [percentage, setPercentage] = useState(
    existing?.completionPercentage ?? 0
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Validar tamanho máximo de 15MB por ficheiro
      const validFiles: File[] = [];
      for (const file of newFiles) {
        if (file.size > 15 * 1024 * 1024) {
          alert(`O ficheiro "${file.name}" excede o limite máximo recomendado de 15MB.`);
        } else {
          validFiles.push(file);
        }
      }
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (formData: FormData) => {
    formData.set("completionPercentage", percentage.toString());
    // Garantir que todos os ficheiros selecionados são enviados
    formData.delete("files");
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    startTransition(async () => {
      await submitBiweeklyReport(formData);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

        {/* Attachments Section */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-blue-400" />
              Anexos do Relatório (Documentos, Word, Projeto em ZIP)
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Podes anexar documentos (.pdf, .docx, .doc), ficheiros de código ou o teu projeto comprimido (.zip, .rar).
            </p>
          </div>

          {/* Anexos já guardados neste relatório */}
          {existing?.attachments && existing.attachments.length > 0 && (
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs font-medium text-slate-300 mb-1">Anexos já submetidos nesta quinzena:</p>
              <AttachmentsList attachments={existing.attachments} canDelete={true} />
            </div>
          )}

          {/* Input de Upload */}
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-5 text-center transition bg-slate-950/40">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".pdf,.doc,.docx,.odt,.zip,.rar,.7z,.tar,.gz,.png,.jpg,.jpeg,.webp,.txt,.md,.xlsx,.pptx"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Clica para selecionar ficheiros ou o projeto em ZIP
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Formatos suportados: ZIP, RAR, Word (DOCX/DOC), PDF, Imagens (até 15MB por ficheiro)
                </p>
              </div>
            </label>
          </div>

          {/* Lista de ficheiros selecionados para submeter */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">
                Ficheiros prontos a enviar ({selectedFiles.length}):
              </p>
              <div className="space-y-1.5">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {file.name.toLowerCase().endsWith(".zip") || file.name.toLowerCase().endsWith(".rar") ? (
                        <FileArchive className="h-4 w-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      )}
                      <span className="text-slate-200 font-medium truncate">{file.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      className="text-slate-400 hover:text-red-400 p-1 transition cursor-pointer"
                      title="Remover ficheiro"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            A enviar relatório e anexos...
          </>
        ) : submitted ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Relatório e Anexos Submetidos!
          </>
        ) : (
          "Submeter Relatório"
        )}
      </button>
    </form>
  );
}
