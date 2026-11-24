"use client";

import { FileText, FileArchive, ImageIcon, FileCode, Download, Trash2, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteReportAttachment } from "@/lib/actions";

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface AttachmentsListProps {
  attachments: AttachmentItem[];
  canDelete?: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(fileName: string, fileType: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".7z") || lower.endsWith(".tar") || lower.endsWith(".gz")) {
    return <FileArchive className="h-4 w-4 text-amber-400 flex-shrink-0" />;
  }
  if (lower.endsWith(".doc") || lower.endsWith(".docx") || lower.endsWith(".odt")) {
    return <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />;
  }
  if (lower.endsWith(".pdf")) {
    return <FileText className="h-4 w-4 text-red-400 flex-shrink-0" />;
  }
  if (fileType.startsWith("image/") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) {
    return <ImageIcon className="h-4 w-4 text-emerald-400 flex-shrink-0" />;
  }
  return <FileCode className="h-4 w-4 text-purple-400 flex-shrink-0" />;
}

export function AttachmentsList({ attachments, canDelete = false }: AttachmentsListProps) {
  const [items, setItems] = useState<AttachmentItem[]>(attachments);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!items || items.length === 0) return null;

  const handleDelete = (attachmentId: string) => {
    if (!confirm("Tens a certeza de que queres remover este anexo?")) return;
    setDeletingId(attachmentId);
    startDeleteTransition(async () => {
      try {
        await deleteReportAttachment(attachmentId);
        setItems((prev) => prev.filter((item) => item.id !== attachmentId));
      } catch (err) {
        console.error(err);
        alert("Erro ao remover o anexo.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-1.5 mt-3">
      <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
        📎 Anexos ({items.length}):
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((att) => (
          <div
            key={att.id}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs transition"
          >
            {getFileIcon(att.fileName, att.fileType)}
            <a
              href={`/api/attachments/${att.id}`}
              download={att.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-200 hover:text-white font-medium max-w-[200px] truncate underline decoration-slate-600 underline-offset-2"
              title={att.fileName}
            >
              {att.fileName}
            </a>
            <span className="text-[11px] text-slate-400 font-mono">
              ({formatFileSize(att.fileSize)})
            </span>
            <a
              href={`/api/attachments/${att.id}`}
              download={att.fileName}
              className="text-slate-400 hover:text-blue-400 p-0.5"
              title="Descarregar ficheiro"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
            {canDelete && (
              <button
                type="button"
                onClick={() => handleDelete(att.id)}
                disabled={isDeleting && deletingId === att.id}
                className="text-slate-400 hover:text-red-400 p-0.5 transition cursor-pointer"
                title="Apagar anexo"
              >
                {isDeleting && deletingId === att.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
