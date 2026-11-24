"use client";

import { useState, useTransition } from "react";
import { updateOrientationSchedule } from "@/lib/actions";
import { Calendar, Clock, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface OrientationSchedulerProps {
  projectId: string;
  currentDate?: Date | string | null;
  currentPlace?: string | null;
  studentName: string;
}

export function OrientationScheduler({
  projectId,
  currentDate,
  currentPlace,
  studentName,
}: OrientationSchedulerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatInputDate = (date?: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [dateValue, setDateValue] = useState(formatInputDate(currentDate));
  const [placeValue, setPlaceValue] = useState(currentPlace || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateOrientationSchedule(projectId, dateValue || null, placeValue);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Agendamento de Orientação de PAP</h3>
            <p className="text-xs text-slate-400">
              Data e hora marcada com {studentName}
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2 rounded-lg transition-colors self-start sm:self-auto"
          >
            {currentDate ? "Alterar Agendamento" : "Marcar Orientação"}
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-4">
          {currentDate ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Clock className="h-4 w-4" />
                <span className="font-bold text-lg">
                  {formatDateTime(currentDate)}
                </span>
              </div>
              {currentPlace && (
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>Local: <strong>{currentPlace}</strong></span>
                </div>
              )}
              {saved && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Agendamento guardado com sucesso!
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Nenhuma sessão de orientação agendada para este aluno.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Data e Hora da Orientação *
              </label>
              <input
                type="datetime-local"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Local / Sala (opcional)
              </label>
              <input
                type="text"
                value={placeValue}
                onChange={(e) => setPlaceValue(e.target.value)}
                placeholder="Ex: Sala de Informática 3 / Online"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Guardar Agendamento
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
