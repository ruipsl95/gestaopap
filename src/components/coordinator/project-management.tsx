"use client";

import { useState, useTransition } from "react";
import { createProject, deleteProject } from "@/lib/actions";
import { Plus, Trash2, Loader2, BookOpen, TrendingUp } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  student: { id: string; name: string };
  teacher: { id: string; name: string };
  reports: { completionPercentage: number }[];
}

interface ProjectManagementProps {
  projects: Project[];
  availableStudents: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}

export function ProjectManagement({
  projects,
  availableStudents,
  teachers,
}: ProjectManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      await createProject(formData);
      setShowForm(false);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem a certeza que pretende eliminar este projeto?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteProject(id);
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Create button */}
      <button
        onClick={() => setShowForm(!showForm)}
        disabled={availableStudents.length === 0 || teachers.length === 0}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Novo Projeto
      </button>

      {availableStudents.length === 0 && teachers.length > 0 && (
        <p className="text-sm text-amber-400">
          ⚠️ Todos os alunos já têm projeto atribuído.
        </p>
      )}

      {/* Create form */}
      {showForm && (
        <form
          action={handleCreate}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Criar Novo Projeto
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Título do Projeto
              </label>
              <input
                name="title"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500"
                placeholder="Ex: App de Gestão de Inventário"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 resize-none"
                placeholder="Breve descrição do projeto..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Aluno
                </label>
                <select
                  name="studentId"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500"
                >
                  <option value="">Selecionar aluno...</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Professor Orientador
                </label>
                <select
                  name="teacherId"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500"
                >
                  <option value="">Selecionar professor...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar Projeto
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => {
          const percentage = project.reports[0]?.completionPercentage ?? 0;
          return (
            <div
              key={project.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">
                      {project.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={deletingId === project.id}
                  className="ml-3 p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Eliminar projeto"
                >
                  {deletingId === project.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-3">
                <span className="text-slate-400">
                  🎓 {project.student.name}
                </span>
                <span className="text-slate-400">
                  👨‍🏫 {project.teacher.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
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
                <span className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Nenhum projeto registado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
